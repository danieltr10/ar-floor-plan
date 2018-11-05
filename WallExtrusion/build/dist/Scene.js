import * as tslib_1 from "tslib"
import * as React from 'react'
import * as THREE from 'three'
var Scene = /** @class */ (function (_super) {
    tslib_1.__extends(Scene, _super)
    function Scene(props) {
        var _this = _super.call(this, props) || this
        _this.start = _this.start.bind(_this)
        _this.stop = _this.stop.bind(_this)
        _this.animate = _this.animate.bind(_this)
        return _this
    }
    Scene.prototype.createTranslationMatrix = function (x, y, z) {
        var matrix = new THREE.Matrix4()
        matrix.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1)
        return matrix
    }
    Scene.prototype.addOffsets = function (f, offsetApplier) {
        var offsets = []
        for (var _i = 2 _i < arguments.length _i++) {
            offsets[_i - 2] = arguments[_i]
        }
        return function () {
            var originalArgs = []
            for (var _i = 0 _i < arguments.length _i++) {
                originalArgs[_i] = arguments[_i]
            }
            var newArgs = originalArgs.map(function (arg, i) { return offsetApplier(arg, offsets[i]) })
            return f.apply(void 0, newArgs)
        }
    }
    Scene.prototype.createGeometryFromPoints = function (pointsArray) {
        var height = 1
        var wall1 = new THREE.BoxGeometry(0.1, height, 1)
        var wall2 = new THREE.BoxGeometry(1, height, 0.1)
        var plant = new THREE.Geometry()
        plant.merge(wall1, this.createTranslationMatrix(0, 0, 0))
        plant.merge(wall2, this.createTranslationMatrix(.45, 0, .45))
        return plant
    }
    Scene.prototype.componentDidMount = function () {
        var width = this.mount.clientWidth
        var height = this.mount.clientHeight
        var scene = new THREE.Scene()
        var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
        var renderer = new THREE.WebGLRenderer({ antialias: true })
        var geometry = this.createGeometryFromPoints([[[0, 0], [0, 1]]])
        var material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
        var cube = new THREE.Mesh(geometry, material)
        var edges = new THREE.EdgesGeometry(geometry)
        var lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))
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
    Scene.prototype.componentWillUnmount = function () {
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }
    Scene.prototype.start = function () {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    }
    Scene.prototype.stop = function () {
        cancelAnimationFrame(this.frameId)
    }
    Scene.prototype.animate = function () {
        this.cube.rotation.x += 0.004
        this.cube.rotation.y += 0.0045
        this.cube.rotation.z += 0.005
        this.edges.rotation.x += 0.004
        this.edges.rotation.y += 0.0045
        this.edges.rotation.z += 0.005
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }
    Scene.prototype.renderScene = function () {
        this.renderer.render(this.scene, this.camera)
    }
    Scene.prototype.render = function () {
        var _this = this
        return (React.createElement("div", { style: { width: '1000px', height: '500px' }, ref: function (mount) { _this.mount = mount } }))
    }
    return Scene
}(React.Component))
export default Scene
//# sourceMappingURL=Scene.js.map