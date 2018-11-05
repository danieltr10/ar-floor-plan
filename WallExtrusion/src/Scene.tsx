import * as React from 'react'
import * as THREE from 'three'

type Point = [number, number]
type Line = [Point, Point]

const wallMatrixExample: Line[] = [
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

class Scene extends React.Component {
    mount: any
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    material: THREE.Material
    cube: THREE.Mesh
    edges: THREE.LineSegments
    frameId: number
    wallHeigth: number = 1
    wallWidth: number = .1

    constructor(props) {
        super(props)

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this.animate = this.animate.bind(this)
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

    distanceBetweenPoints(a: Point, b: Point): number {
        const [[x1, y1], [x2, y2]] = [a, b];
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2)
    }

    angleFromXAxis(line: Line): number {
        const [[x1, y1], [x2, y2]] = line
        return Math.atan((y2-y1)/(x2-x1))
    }

    getLineMidPoint(line: Line): Point {
        const [[x1, y1], [x2, y2]] = line
        return [(x1 + x2)/2, (y1 + y2)/2]
    }

    createGeometryFromPoints(pointsArray: Line[], scaling = .01, plant = new THREE.Geometry) {
        if (pointsArray.length <= 0) {
            return plant;
        } else {
            const [firstLine, ...rest] = pointsArray
            const d = this.distanceBetweenPoints(...firstLine)
            const angle = this.angleFromXAxis(firstLine) 
            const wall2 = new THREE.BoxGeometry(d*scaling, this.wallWidth*scaling*50, this.wallHeigth*scaling*50).rotateZ(angle)
            
            const [x, y] = this.getLineMidPoint(firstLine)
            plant.merge(wall2, this.createTranslationMatrix(x*scaling, y*scaling, 0))

            return this.createGeometryFromPoints(rest, scaling, plant)
        }
    }

    componentDidMount() {
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            2000
        )
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const geometry = this.createGeometryFromPoints(wallMatrixExample)
            .applyMatrix(this.createTranslationMatrix(-3.2, -2.5, -1))
            .rotateX(-Math.PI/6)
            .rotateX(Math.PI)
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
        const cube = new THREE.Mesh(geometry, material)

        const edges = new THREE.EdgesGeometry(geometry)
        const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))
        scene.add(lines)

        camera.position.z = 4
        scene.add(cube)
        renderer.setClearColor('#000000')
        renderer.setSize(width, height)

        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.material = material
        this.cube = cube
        this.edges = lines

        this.mount.appendChild(this.renderer.domElement)
        this.start()
    }

    componentWillUnmount() {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        // this.cube.rotation.x += 0.004
        // this.cube.rotation.y += 0.0045
        // this.cube.rotation.z += 0.005
        // this.edges.rotation.x += 0.004
        // this.edges.rotation.y += 0.0045
        // this.edges.rotation.z += 0.005

        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }

    renderScene() {
        this.renderer.render(this.scene, this.camera)
    }

    render() {
        return (
            <div
                style={{ width: '1000px', height: '500px' }}
                ref={(mount) => { this.mount = mount }}
            />
        )
    }
}

export default Scene