import React from 'react';
import { AR, Asset } from 'expo';
// Let's alias ExpoTHREE.AR as ThreeAR so it doesn't collide with Expo.AR.
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View, Slider } from 'react-native';
// Let's also import `expo-graphics`
// expo-graphics manages the setup/teardown of the gl context/ar session, creates a frame-loop, and observes size/orientation changes.
// it also provides debug information with `isArCameraStateEnabled`
import { View as GraphicsView } from 'expo-graphics';

const wallMatrixExample = [
    [[313, 124],[521, 124]],
    [[356, 370],[421, 370]],
    [[93, 119],[227, 119]],
    [[269, 253],[348, 253]],
    [[385, 120],[521, 120]],
    [[208, 212],[285, 213]],
    [[516, 334],[516, 219]],
    [[93, 161],[93, 123]],
    [[211, 370],[297, 370]],
    [[270, 366],[270, 255]],
    [[382, 373],[382, 251]],
    [[521, 300],[521, 217]],
    [[479, 372],[520, 373]],
    [[207, 210],[207, 126]],
    [[366, 213],[421, 213]],
    [[370, 215],[370, 119]],
    [[319, 215],[319, 119]],
    [[450, 254],[512, 254]],
    [[92, 371],[93, 311]],
    [[516, 125],[517, 159]],
    [[520, 372],[520, 301]],
    [[99, 123],[211, 125]],
    [[419, 179],[419, 127]],
    [[95, 279],[95, 219]],
    [[91, 223],[91, 249]],
    [[100, 369],[153, 370]],
    [[313, 120],[384, 119]]
]

export default class App extends React.Component {
	constructor(props) {
		super(props);

	}

	createTranslationMatrix(x, y, z) {
			const matrix = new THREE.Matrix4()
			matrix.set(
					1,0,0,x,
					0,1,0,y,
					0,0,1,z,
					0,0,0,1,
			)

			return matrix
	}

	distanceBetweenPoints(a, b) {
			const [[x1, y1], [x2, y2]] = [a, b];
			return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
	}

	angleFromXAxis(line) {
			const [[x1, y1], [x2, y2]] = line
			return Math.atan((y2-y1)/(x2-x1))
	}

	getLineMidPoint(line) {
			const [[x1, y1], [x2, y2]] = line
			return [(x1 + x2)/2, (y1 + y2)/2]
	}

	createGeometryFromPoints(pointsArray, scaling = .001, plant = new THREE.Geometry) {
			const wallWidth = 0.1
			const wallHeigth = 1
			if (pointsArray.length <= 0) {
					return plant;
			} else {
					const [firstLine, ...rest] = pointsArray
					const d = this.distanceBetweenPoints(...firstLine)
					const angle = this.angleFromXAxis(firstLine)
					const wall2 = new THREE.BoxGeometry(d*scaling, wallWidth*scaling*50, wallHeigth*scaling*50).rotateZ(angle)

					const [x, y] = this.getLineMidPoint(firstLine)
					plant.merge(wall2, this.createTranslationMatrix(x*scaling, y*scaling, 0))

					return this.createGeometryFromPoints(rest, scaling, plant)
			}
	}

	componentDidMount() {
		// Turn off extra warnings
		THREE.suppressExpoWarnings(true);
		ThreeAR.suppressWarnings();
		this.currentScale = 0;
		this.previousScale = 0;
	}

	render() {
		// You need to add the `isArEnabled` & `arTrackingConfiguration` props.
		// `isArRunningStateEnabled` Will show us the play/pause button in the corner.
		// `isArCameraStateEnabled` Will render the camera tracking information on the screen.
		// `arTrackingConfiguration` denotes which camera the AR Session will use.
		// World for rear, Face for front (iPhone X only)
		return (
			<View style={{ flex: 1 }}>
				<GraphicsView
					style={{ flex: 0.8 }}
					onContextCreate={this.onContextCreate}
					onRender={this.onRender}
					onResize={this.onResize}
					isArEnabled
					isArRunningStateEnabled
					isArCameraStateEnabled
					arTrackingConfiguration={AR.TrackingConfigurations.World}
				/>
				<Slider
					step={0.1}
					maximumValue={2}
					onValueChange={value => {
						this.currentScale = value;
					}}
					value={this.currentScale}
				/>
			</View>
		);
	}

	// When our context is built we can start coding 3D things.
	onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
		// This will allow ARKit to collect Horizontal surfaces
		AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

		const listener = AR.onFrameDidUpdate(() => {
			if (this.previousScale !== this.currentScale) {
				this.cube.scale.y = this.currentScale;
        const delta = this.currentScale - this.previousScale
        if (this.previousScale !== 1) {
          this.cube.translateY((delta / 35));
        }
				this.previousScale = this.currentScale;
			}
		});

		// Create a 3D renderer
		this.renderer = new ExpoTHREE.Renderer({
			gl,
			pixelRatio,
			width,
			height
		});

		// We will add all of our meshes to this scene.
		this.scene = new THREE.Scene();
		// This will create a camera texture and use it as the background for our scene
		this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
		// Now we make a camera that matches the device orientation.
		// Ex: When we look down this camera will rotate to look down too!
		this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);

		// Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
		const geometry = this.createGeometryFromPoints(wallMatrixExample)
				.rotateX(-Math.PI/2)
				.rotateX(Math.PI)
		// Simple color material
		const edges = new THREE.EdgesGeometry(geometry)

		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff
		});

		// Combine our geometry and material
		this.cube = new THREE.Mesh(geometry, material);
		// Place the box 0.4 meters in front of us.
		this.cube.position.z = -0.4;

		// Add the cube to the scene
		this.scene.add(this.cube);

		// Setup a light so we can see the cube color
		// AmbientLight colors all things in the scene equally.
		this.scene.add(new THREE.DirectionalLight( 0xffffff, 0.5));

		this.cube.scale = 0;

	};

	// When the phone rotates, or the view changes size, this method will be called.
	onResize = ({ x, y, scale, width, height }) => {
		// Let's stop the function if we haven't setup our scene yet
		if (!this.renderer) {
			return;
		}
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setPixelRatio(scale);
		this.renderer.setSize(width, height);
	};

	// Called every frame.
	onRender = () => {
		// Finally render the scene with the AR Camera
		this.renderer.render(this.scene, this.camera);
	};
}
