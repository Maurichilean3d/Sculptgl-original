import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Enums from 'misc/Enums';

var _TMP_VEC3 = new THREE.Vector3();
var _TMP_VEC3_B = new THREE.Vector3();
var _TMP_VEC3_C = new THREE.Vector3();

class ModelingSystem {

  constructor(main) {
    this._main = main;
    this._enabled = false;

    this._canvas = document.createElement('canvas');
    this._canvas.id = 'modeling-canvas';
    this._canvas.style.position = 'absolute';
    this._canvas.style.left = '0';
    this._canvas.style.top = '0';
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.zIndex = '2';
    main.getViewport().appendChild(this._canvas);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(50, 1.0, 0.01, 100.0);
    this._camera.position.set(1.8, 1.8, 1.8);
    this._camera.lookAt(0, 0, 0);

    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, alpha: true, antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio || 1.0);

    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._selectionMode = Enums.Tools.ELEMENTSELECT;
    this._selectionType = 'face';
    this._selectionAction = 'replace';
    this._selectedIndices = [];
    this._selectionAnchor = new THREE.Object3D();
    this._scene.add(this._selectionAnchor);

    this._transform = new TransformControls(this._camera, this._canvas);
    this._transform.setSpace('world');
    this._transform.setMode('translate');
    this._transform.attach(this._selectionAnchor);
    this._scene.add(this._transform);

    this._transform.addEventListener('dragging-changed', function (event) {
      this._isDragging = event.value;
    }.bind(this));
    this._transform.addEventListener('objectChange', this.onTransformChange.bind(this));

    var light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(2, 3, 4);
    this._scene.add(light);
    this._scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    var geometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
    var material = new THREE.MeshStandardMaterial({ color: 0x8ea0ff, flatShading: true });
    this._mesh = new THREE.Mesh(geometry, material);
    this._scene.add(this._mesh);

    this._selectionHelper = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xffcc00, side: THREE.DoubleSide }));
    this._scene.add(this._selectionHelper);

    this._canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this._canvas.style.pointerEvents = enabled ? 'auto' : 'none';
    this._canvas.style.display = enabled ? 'block' : 'none';
    this.render();
  }

  onResize(width, height, pixelRatio) {
    this._renderer.setPixelRatio(pixelRatio || 1.0);
    this._renderer.setSize(width / (pixelRatio || 1.0), height / (pixelRatio || 1.0), false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this.render();
  }

  setSelectionMode(mode) {
    switch (mode) {
    case 0:
      this._selectionType = 'vertex';
      break;
    case 1:
      this._selectionType = 'edge';
      break;
    default:
      this._selectionType = 'face';
      break;
    }
  }

  setSelectionAction(action) {
    switch (action) {
    case 1:
      this._selectionAction = 'add';
      break;
    case 2:
      this._selectionAction = 'remove';
      break;
    default:
      this._selectionAction = 'replace';
      break;
    }
  }

  onPointerDown(event) {
    if (!this._enabled || this._isDragging)
      return;
    var rect = this._canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width;
    var y = (event.clientY - rect.top) / rect.height;
    this._mouse.set(x * 2 - 1, -(y * 2 - 1));
    this._raycaster.setFromCamera(this._mouse, this._camera);
    var hit = this._raycaster.intersectObject(this._mesh, false)[0];
    if (!hit) return;

    if (this._selectionAction === 'replace') {
      this._selectedIndices = [];
    }

    if (this._selectionType === 'face')
      this.selectFace(hit);
    else if (this._selectionType === 'edge')
      this.selectEdge(hit);
    else
      this.selectVertex(hit);

    this.updateSelectionHelper();
    this.render();
  }

  selectFace(hit) {
    var faceIndex = Math.floor(hit.faceIndex / 2);
    var firstVert = faceIndex * 6;
    var indices = [];
    for (var i = 0; i < 6; ++i) indices.push(firstVert + i);
    this.applySelection(indices);
  }

  selectEdge(hit) {
    var geom = this._mesh.geometry;
    var pos = geom.getAttribute('position');
    var faceIndex = Math.floor(hit.faceIndex / 2);
    var base = faceIndex * 6;
    var edges = [
      [base + 0, base + 1],
      [base + 1, base + 2],
      [base + 2, base + 0]
    ];
    var best = edges[0];
    var bestDist = Infinity;
    for (var i = 0; i < edges.length; ++i) {
      var a = edges[i][0];
      var b = edges[i][1];
      _TMP_VEC3.fromBufferAttribute(pos, a);
      _TMP_VEC3_B.fromBufferAttribute(pos, b);
      var dist = _TMP_VEC3.distanceTo(hit.point) + _TMP_VEC3_B.distanceTo(hit.point);
      if (dist < bestDist) {
        bestDist = dist;
        best = edges[i];
      }
    }
    this.applySelection([best[0], best[1]]);
  }

  selectVertex(hit) {
    var geom = this._mesh.geometry;
    var pos = geom.getAttribute('position');
    var base = hit.faceIndex * 3;
    var best = base;
    var bestDist = Infinity;
    for (var i = 0; i < 3; ++i) {
      _TMP_VEC3.fromBufferAttribute(pos, base + i);
      var dist = _TMP_VEC3.distanceTo(hit.point);
      if (dist < bestDist) {
        bestDist = dist;
        best = base + i;
      }
    }
    this.applySelection([best]);
  }

  applySelection(indices) {
    if (this._selectionAction === 'remove') {
      var remaining = [];
      for (var i = 0; i < this._selectedIndices.length; ++i) {
        if (indices.indexOf(this._selectedIndices[i]) === -1)
          remaining.push(this._selectedIndices[i]);
      }
      this._selectedIndices = remaining;
      return;
    }

    for (var j = 0; j < indices.length; ++j) {
      if (this._selectedIndices.indexOf(indices[j]) === -1)
        this._selectedIndices.push(indices[j]);
    }
  }

  updateSelectionHelper() {
    var geom = this._mesh.geometry;
    var pos = geom.getAttribute('position');
    var indices = this._selectedIndices;
    if (!indices.length) {
      this._selectionHelper.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
      return;
    }

    var verts = new Float32Array(indices.length * 3);
    for (var i = 0; i < indices.length; ++i) {
      _TMP_VEC3.fromBufferAttribute(pos, indices[i]);
      verts[i * 3] = _TMP_VEC3.x;
      verts[i * 3 + 1] = _TMP_VEC3.y;
      verts[i * 3 + 2] = _TMP_VEC3.z;
    }
    this._selectionHelper.geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    this._selectionHelper.geometry.computeVertexNormals();
    this._selectionHelper.visible = true;

    this._selectionAnchor.position.set(0, 0, 0);
    for (var j = 0; j < indices.length; ++j) {
      _TMP_VEC3.fromBufferAttribute(pos, indices[j]);
      this._selectionAnchor.position.add(_TMP_VEC3);
    }
    this._selectionAnchor.position.multiplyScalar(1.0 / indices.length);
    this._lastAnchor = this._selectionAnchor.position.clone();
  }

  onTransformChange() {
    if (!this._selectedIndices.length)
      return;
    var geom = this._mesh.geometry;
    var pos = geom.getAttribute('position');
    var delta = _TMP_VEC3_C.copy(this._selectionAnchor.position).sub(this._lastAnchor || this._selectionAnchor.position);
    if (delta.lengthSq() === 0.0)
      return;
    for (var i = 0; i < this._selectedIndices.length; ++i) {
      var idx = this._selectedIndices[i];
      _TMP_VEC3.fromBufferAttribute(pos, idx);
      _TMP_VEC3.add(delta);
      pos.setXYZ(idx, _TMP_VEC3.x, _TMP_VEC3.y, _TMP_VEC3.z);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    this._lastAnchor.copy(this._selectionAnchor.position);
    this.updateSelectionHelper();
    this.render();
  }

  extrudeSelection(distance) {
    if (!this._selectedIndices.length)
      return;
    var geom = this._mesh.geometry;
    var pos = geom.getAttribute('position');
    var normal = new THREE.Vector3();
    if (this._selectedIndices.length >= 3) {
      _TMP_VEC3.fromBufferAttribute(pos, this._selectedIndices[0]);
      _TMP_VEC3_B.fromBufferAttribute(pos, this._selectedIndices[1]);
      _TMP_VEC3_C.fromBufferAttribute(pos, this._selectedIndices[2]);
      normal.subVectors(_TMP_VEC3_B, _TMP_VEC3).cross(_TMP_VEC3_C.sub(_TMP_VEC3)).normalize();
    }
    normal.normalize();
    for (var j = 0; j < this._selectedIndices.length; ++j) {
      var idx = this._selectedIndices[j];
      _TMP_VEC3.fromBufferAttribute(pos, idx);
      _TMP_VEC3.addScaledVector(normal, distance);
      pos.setXYZ(idx, _TMP_VEC3.x, _TMP_VEC3.y, _TMP_VEC3.z);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
    this.render();
  }

  render() {
    if (!this._enabled)
      return;
    this._renderer.render(this._scene, this._camera);
  }
}

export default ModelingSystem;
