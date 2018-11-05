import * as React from 'react'
import * as THREE from 'three'

type Point = [number, number]
type Line = [Point, Point]

class Scene extends React.Component {
    mount: any
    scene: THREE.Scene
    camera: THREE.Camera
    renderer: THREE.Renderer
    material: THREE.Material
    cube: THREE.Mesh
    edges: THREE.LineSegments
    frameId: number

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

    addOffsets<T, U>(
            f: (...args: T[]) => any, 
            offsetApplier: (originalArg: T, offset: U) => T, 
            ...offsets: U[]
        ): (...args: T[]) => any {
        return (...originalArgs) => {
            const newArgs = originalArgs.map((arg, i) =>  offsetApplier(arg, offsets[i]))
            return f(...newArgs)
        }
    }

    createGeometryFromPoints(pointsArray: Line[]) {
        const height = 1
        const wall1 = new THREE.BoxGeometry(1, height, .1)
        const wall2 = new THREE.BoxGeometry(1, height, .1).rotateY(-Math.PI/4)

        const plant = new THREE.Geometry()

        plant.merge(wall1, this.createTranslationMatrix(0, 0, 0))

        plant.merge(wall2, this.createTranslationMatrix(.9, 0, .4))

        return plant
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
        const geometry = this.createGeometryFromPoints([[[0,0], [0,1]]])
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
        this.cube.rotation.x += 0.004
        this.cube.rotation.y += 0.0045
        this.cube.rotation.z += 0.005
        this.edges.rotation.x += 0.004
        this.edges.rotation.y += 0.0045
        this.edges.rotation.z += 0.005

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