import { vec3, mat4 } from 'gl-matrix';
import getOptionsURL from 'misc/getOptionsURL';
import Enums from 'misc/Enums';
import Utils from 'misc/Utils';
import SculptManager from 'editing/SculptManager';
import Subdivision from 'editing/Subdivision';
import Import from 'files/Import';
import Gui from 'gui/Gui';
import Camera from 'math3d/Camera';
import Picking from 'math3d/Picking';
import Background from 'drawables/Background';
import Mesh from 'mesh/Mesh';
import Multimesh from 'mesh/multiresolution/Multimesh';
import Primitives from 'drawables/Primitives';
import StateManager from 'states/StateManager';
import RenderData from 'mesh/RenderData';
import Rtt from 'drawables/Rtt';
import ShaderLib from 'render/ShaderLib';
import MeshStatic from 'mesh/meshStatic/MeshStatic';
import WebGLCaps from 'render/WebGLCaps';
import ModelingSystem from 'modeling/ModelingSystem';

var _TMP_AUTO_ROT_CENTER = vec3.create();
var _TMP_AUTO_ROT_AXIS = vec3.create();
var _TMP_AUTO_ROT_MAT = mat4.create();

class Scene {

  constructor() {
    this._gl = null; // webgl context

    this._cameraSpeed = 0.25;

    // cache canvas stuffs
    this._pixelRatio = 1.0;
    this._viewport = document.getElementById('viewport');
    this._canvas = document.getElementById('canvas');
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._canvasOffsetLeft = 0;
    this._canvasOffsetTop = 0;

    // core of the app
    this._stateManager = new StateManager(this); // for undo-redo
    this._sculptManager = null;
    this._camera = new Camera(this);
    this._picking = new Picking(this); // the ray picking
    this._pickingSym = new Picking(this, true); // the symmetrical picking

    // TODO primitive builder
    this._meshPreview = null;
    this._torusLength = 0.5;
    this._torusWidth = 0.1;
    this._torusRadius = Math.PI * 2;
    this._torusRadial = 32;
    this._torusTubular = 128;

    // renderable stuffs
    var opts = getOptionsURL();
    this._showContour = opts.outline;
    this._showGrid = opts.grid;
    this._grid = null;
    this._background = null;
    this._meshes = []; // the meshes
    this._selectMeshes = []; // multi selection
    this._mesh = null; // the selected mesh

    this._rttContour = null; // rtt for contour
    this._rttMerge = null; // rtt decode opaque + merge transparent
    this._rttOpaque = null; // rtt half float
    this._rttTransparent = null; // rtt rgbm

    // ui stuffs
    this._focusGui = false; // if the gui is being focused
    this._gui = new Gui(this);

    this._preventRender = false; // prevent multiple render per frame
    this._drawFullScene = false; // render everything on the rtt
    this._autoMatrix = opts.scalecenter; // scale and center the imported meshes
    this._vertexSRGB = true; // srgb vs linear colorspace for vertex color

    this._autoRotateEnabled = false;
    this._autoRotateSpeed = Math.PI / 6.0;
    this._autoRotateAxis = 1;
    this._autoRotatePivot = 0;
    this._autoRotateLastTime = null;

    this._modelingSystem = null;
  }

  start() {
    this.initWebGL();
    if (!this._gl)
      return;

    this._sculptManager = new SculptManager(this);
    this._background = new Background(this._gl, this);

    this._rttContour = new Rtt(this._gl, Enums.Shader.CONTOUR, null);
    this._rttMerge = new Rtt(this._gl, Enums.Shader.MERGE, null);
    this._rttOpaque = new Rtt(this._gl, Enums.Shader.FXAA);
    this._rttTransparent = new Rtt(this._gl, null, this._rttOpaque.getDepth(), true);

    this._grid = Primitives.createGrid(this._gl);
    this.initGrid();

    this.loadTextures();
    this._gui.initGui();
    this.onCanvasResize();

    var modelURL = getOptionsURL().modelurl;
    if (modelURL) this.addModelURL(modelURL);
    else this.addSphere();
  }

  addModelURL(url) {
    var fileType = this.getFileType(url);
    if (!fileType)
      return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.responseType = fileType === 'obj' ? 'text' : 'arraybuffer';

    xhr.onload = function () {
      if (xhr.status === 200)
        this.loadScene(xhr.response, fileType);
    }.bind(this);

    xhr.send(null);
  }

  getBackground() {
    return this._background;
  }

  getViewport() {
    return this._viewport;
  }

  getCanvas() {
    return this._canvas;
  }

  getPixelRatio() {
    return this._pixelRatio;
  }

  getCanvasWidth() {
    return this._canvasWidth;
  }

  getCanvasHeight() {
    return this._canvasHeight;
  }

  getCamera() {
    return this._camera;
  }

  getGui() {
    return this._gui;
  }

  getModelingSystem() {
    return this._modelingSystem;
  }

  enableModelingSystem(enabled) {
    if (!this._modelingSystem)
      this._modelingSystem = new ModelingSystem(this);
    this._modelingSystem.setEnabled(enabled);
    if (enabled) this.render();
  }

  getMeshes() {
    return this._meshes;
  }

  getMesh() {
    return this._mesh;
  }

  getSelectedMeshes() {
    return this._selectMeshes;
  }

  getPicking() {
    return this._picking;
  }

  getPickingSymmetry() {
    return this._pickingSym;
  }

  getSculptManager() {
    return this._sculptManager;
  }

  getStateManager() {
    return this._stateManager;
  }

  setMesh(mesh) {
    return this.setOrUnsetMesh(mesh);
  }

  setCanvasCursor(style) {
    this._canvas.style.cursor = style;
  }

  setAutoRotateEnabled(enabled) {
    this._autoRotateEnabled = enabled;
    this._autoRotateLastTime = null;
    if (enabled) this.render();
  }

  setAutoRotateSpeed(speed) {
    this._autoRotateSpeed = speed;
  }

  setAutoRotateAxis(axis) {
    this._autoRotateAxis = axis;
  }

  setAutoRotatePivot(pivot) {
    this._autoRotatePivot = pivot;
  }

  _updateAutoRotate() {
    if (!this._autoRotateEnabled || !this._mesh)
      return;

    var now = performance.now();
    if (this._autoRotateLastTime === null) {
      this._autoRotateLastTime = now;
      return;
    }

    var deltaSeconds = (now - this._autoRotateLastTime) / 1000.0;
    this._autoRotateLastTime = now;

    var speed = this._autoRotateSpeed;
    if (!speed)
      return;

    var rot = speed * deltaSeconds;
    var mesh = this._mesh;
    var mat = mesh.getMatrix();
    vec3.set(_TMP_AUTO_ROT_AXIS, 0.0, 0.0, 0.0);
    _TMP_AUTO_ROT_AXIS[this._autoRotateAxis] = 1.0;
    mat4.identity(_TMP_AUTO_ROT_MAT);
    if (this._autoRotatePivot === 0) {
      vec3.transformMat4(_TMP_AUTO_ROT_CENTER, mesh.getCenter(), mat);
      mat4.translate(_TMP_AUTO_ROT_MAT, _TMP_AUTO_ROT_MAT, _TMP_AUTO_ROT_CENTER);
      mat4.rotate(_TMP_AUTO_ROT_MAT, _TMP_AUTO_ROT_MAT, rot, _TMP_AUTO_ROT_AXIS);
      mat4.translate(_TMP_AUTO_ROT_MAT, _TMP_AUTO_ROT_MAT, [-_TMP_AUTO_ROT_CENTER[0], -_TMP_AUTO_ROT_CENTER[1], -_TMP_AUTO_ROT_CENTER[2]]);
    } else {
      mat4.rotate(_TMP_AUTO_ROT_MAT, _TMP_AUTO_ROT_MAT, rot, _TMP_AUTO_ROT_AXIS);
    }
    mat4.mul(mat, _TMP_AUTO_ROT_MAT, mat);
    mesh.updateYawPitchRollFromMatrix();
  }

  initGrid() {
    var grid = this._grid;
    grid.normalizeSize();
    var gridm = grid.getMatrix();
    mat4.translate(gridm, gridm, [0.0, -0.45, 0.0]);
    var scale = 2.5;
    mat4.scale(gridm, gridm, [scale, scale, scale]);
    this._grid.setShaderType(Enums.Shader.FLAT);
    grid.setFlatColor([0.04, 0.04, 0.04]);
  }

  setOrUnsetMesh(mesh, multiSelect) {
    if (!mesh) {
      this._selectMeshes.length = 0;
    } else if (!multiSelect) {
      this._selectMeshes.length = 0;
      this._selectMeshes.push(mesh);
    } else {
      var id = this.getIndexSelectMesh(mesh);
      if (id >= 0) {
        if (this._selectMeshes.length > 1) {
          this._selectMeshes.splice(id, 1);
          mesh = this._selectMeshes[0];
        }
      } else {
        this._selectMeshes.push(mesh);
      }
    }

    this._mesh = mesh;
    this.getGui().updateMesh();
    this.render();
    return mesh;
  }

  renderSelectOverRtt() {
    if (this._requestRender())
      this._drawFullScene = false;
  }

  _requestRender() {
    if (this._preventRender === true)
      return false; // render already requested for the next frame

    window.requestAnimationFrame(this.applyRender.bind(this));
    this._preventRender = true;
    return true;
  }

  render() {
    this._drawFullScene = true;
    this._requestRender();
  }

  applyRender() {
    this._preventRender = false;
    this._updateAutoRotate();
    this.updateMatricesAndSort();

    var gl = this._gl;
    if (!gl) return;

    if (this._drawFullScene) this._drawScene();

    gl.disable(gl.DEPTH_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._rttMerge.getFramebuffer());
    this._rttMerge.render(this); // merge + decode

    // render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this._rttOpaque.render(this); // fxaa

    gl.enable(gl.DEPTH_TEST);

    this._sculptManager.postRender(); // draw sculpting gizmo stuffs

    if (this._autoRotateEnabled && this._mesh) this.render();
  }

  _drawScene() {
    var gl = this._gl;
    var i = 0;
    var meshes = this._meshes;
    var nbMeshes = meshes.length;

    ///////////////
    // CONTOUR 1/2
    ///////////////
    gl.disable(gl.DEPTH_TEST);
    var showContour = this._selectMeshes.length > 0 && this._showContour && ShaderLib[Enums.Shader.CONTOUR].color[3] > 0.0;
    if (showContour) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._rttContour.getFramebuffer());
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (var s = 0, sel = this._selectMeshes, nbSel = sel.length; s < nbSel; ++s)
        sel[s].renderFlatColor(this);
    }
    gl.enable(gl.DEPTH_TEST);

    ///////////////
    // OPAQUE PASS
    ///////////////
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._rttOpaque.getFramebuffer());
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // grid
    if (this._showGrid) this._grid.render(this);

    // (post opaque pass)
    for (i = 0; i < nbMeshes; ++i) {
      if (meshes[i].isTransparent()) break;
      meshes[i].render(this);
    }
    var startTransparent = i;
    if (this._meshPreview) this._meshPreview.render(this);

    // background
    this._background.render();

    ///////////////
    // TRANSPARENT PASS
    ///////////////
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._rttTransparent.getFramebuffer());
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);

    // wireframe for dynamic mesh has duplicate edges
    gl.depthFunc(gl.LESS);
    for (i = 0; i < nbMeshes; ++i) {
      if (meshes[i].getShowWireframe())
        meshes[i].renderWireframe(this);
    }
    gl.depthFunc(gl.LEQUAL);

    // transparent meshes
    for (i = startTransparent; i < nbMeshes; ++i)
      meshes[i].render(this);

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  /** Pre compute matrices and sort meshes */
  updateMatricesAndSort() {
    var meshes = this._meshes;
    var cam = this._camera;
    if (meshes.length > 0) {
      cam.optimizeNearFar(this.computeBoundingBoxScene());
    }

    for (var i = 0, nb = meshes.length; i < nb; ++i) {
      meshes[i].updateMatrices(cam);
    }

    meshes.sort(Mesh.sortFunction);

    if (this._meshPreview) this._meshPreview.updateMatrices(cam);
    if (this._grid) this._grid.updateMatrices(cam);
  }

  initWebGL() {
    var attributes = {
      antialias: false,
      stencil: true
    };

    var canvas = document.getElementById('canvas');
    var gl = this._gl = canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
    if (!gl) {
      window.alert('Could not initialise WebGL. No WebGL, no SculptGL. Sorry.');
      return;
    }

    WebGLCaps.initWebGLExtensions(gl);
    if (!WebGLCaps.getWebGLExtension('OES_element_index_uint'))
      RenderData.ONLY_DRAW_ARRAYS = true;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

    gl.disable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    gl.disable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.disable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /** Load textures (preload) */
  loadTextures() {
    var self = this;
    var gl = this._gl;
    var ShaderMatcap = ShaderLib[Enums.Shader.MATCAP];

    var loadTex = function (path, idMaterial) {
      var mat = new Image();
      mat.src = path;

      mat.onload = function () {
        ShaderMatcap.createTexture(gl, mat, idMaterial);
        self.render();
      };
    };

    for (var i = 0, mats = ShaderMatcap.matcaps, l = mats.length; i < l; ++i)
      loadTex(mats[i].path, i);

    this.initAlphaTextures();
  }

  initAlphaTextures() {
    var alphas = Picking.INIT_ALPHAS_PATHS;
    var names = Picking.INIT_ALPHAS_NAMES;
    for (var i = 0, nbA = alphas.length; i < nbA; ++i) {
      var am = new Image();
      am.src = 'resources/alpha/' + alphas[i];
      am.onload = this.onLoadAlphaImage.bind(this, am, names[i]);
    }
  }

  /** Called when the window is resized */
  onCanvasResize() {
    var viewport = this._viewport;
    var newWidth = viewport.clientWidth * this._pixelRatio;
    var newHeight = viewport.clientHeight * this._pixelRatio;

    this._canvasOffsetLeft = viewport.offsetLeft;
    this._canvasOffsetTop = viewport.offsetTop;
    this._canvasWidth = newWidth;
    this._canvasHeight = newHeight;

    this._canvas.width = newWidth;
    this._canvas.height = newHeight;

    this._gl.viewport(0, 0, newWidth, newHeight);
    this._camera.onResize(newWidth, newHeight);
    this._background.onResize(newWidth, newHeight);

    this._rttContour.onResize(newWidth, newHeight);
    this._rttMerge.onResize(newWidth, newHeight);
    this._rttOpaque.onResize(newWidth, newHeight);
    this._rttTransparent.onResize(newWidth, newHeight);
    if (this._modelingSystem)
      this._modelingSystem.onResize(newWidth, newHeight, this._pixelRatio);

    this.render();
  }

  computeRadiusFromBoundingBox(box) {
    var dx = box[3] - box[0];
    var dy = box[4] - box[1];
    var dz = box[5] - box[2];
    return 0.5 * Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  computeBoundingBoxMeshes(meshes) {
    var bound = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (var i = 0, l = meshes.length; i < l; ++i) {
      if (!meshes[i].isVisible()) continue;
      var bi = meshes[i].computeWorldBound();
      if (bi[0] < bound[0]) bound[0] = bi[0];
      if (bi[1] < bound[1]) bound[1] = bi[1];
      if (bi[2] < bound[2]) bound[2] = bi[2];
      if (bi[3] > bound[3]) bound[3] = bi[3];
      if (bi[4] > bound[4]) bound[4] = bi[4];
      if (bi[5] > bound[5]) bound[5] = bi[5];
    }
    return bound;
  }

  computeBoundingBoxScene() {
    var scene = this._meshes.slice();
    scene.push(this._grid);
    this._sculptManager.addSculptToScene(scene);
    return this.computeBoundingBoxMeshes(scene);
  }

  normalizeAndCenterMeshes(meshes) {
    var box = this.computeBoundingBoxMeshes(meshes);
    var scale = Utils.SCALE / vec3.dist([box[0], box[1], box[2]], [box[3], box[4], box[5]]);

    var mCen = mat4.create();
    mat4.scale(mCen, mCen, [scale, scale, scale]);
    mat4.translate(mCen, mCen, [-(box[0] + box[3]) * 0.5, -(box[1] + box[4]) * 0.5, -(box[2] + box[5]) * 0.5]);

    for (var i = 0, l = meshes.length; i < l; ++i) {
      var mat = meshes[i].getMatrix();
      mat4.mul(mat, mCen, mat);
      meshes[i].updateGeometry();
      meshes[i].updateGeometryBuffers();
    }
  }

  addMesh(mesh, merge) {
    if (!mesh)
      return;

    if (merge) {
      this.mergeMeshes(this._mesh, mesh);
      return;
    }

    this._meshes.push(mesh);
    this.setOrUnsetMesh(mesh);
  }

  replaceMesh(mesh, newMesh) {
    var id = this.getIndexMesh(mesh);
    if (id !== -1)
      this._meshes[id] = newMesh;
    this.setOrUnsetMesh(newMesh);
  }

  getIndexMesh(mesh) {
    for (var i = 0, l = this._meshes.length; i < l; ++i)
      if (this._meshes[i] === mesh)
        return i;
    return -1;
  }

  getIndexSelectMesh(mesh) {
    for (var i = 0, l = this._selectMeshes.length; i < l; ++i)
      if (this._selectMeshes[i] === mesh)
        return i;
    return -1;
  }

  isVertexSRGB() {
    return this._vertexSRGB;
  }

  isMeshSelected() {
    return !!this._mesh;
  }

  setPixelRatio(ratio) {
    this._pixelRatio = ratio;
  }

  setVertexSRGB(bool) {
    this._vertexSRGB = bool;
  }

  updateMeshBuffers() {
    var mesh = this._mesh;
    if (!mesh)
      return;
    if (mesh.isDynamic)
      mesh.updateBuffers();
    else
      mesh.updateGeometryBuffers();
  }

  mergeMeshes(mesh, meshToMerge) {
    if (!mesh || !meshToMerge || mesh === meshToMerge)
      return;

    var id = this.getIndexMesh(meshToMerge);
    if (id >= 0)
      this._meshes.splice(id, 1);

    var state = this._stateManager.getCurrentState();
    if (state)
      state.squash = true;

    this._stateManager.pushStateAddRemove(mesh, meshToMerge, true);

    mesh.merge(meshToMerge);

    this.render();
  }

  addSphere() {
    var mesh = Primitives.createSphere(this._gl);
    if (!this._mesh)
      this.addMesh(mesh, false);
    else
      this.addMesh(mesh, true);
  }

  addCube() {
    var mesh = Primitives.createCube(this._gl);
    if (!this._mesh)
      this.addMesh(mesh, false);
    else
      this.addMesh(mesh, true);
  }

  addCylinder() {
    var mesh = Primitives.createCylinder(this._gl);
    if (!this._mesh)
      this.addMesh(mesh, false);
    else
      this.addMesh(mesh, true);
  }

  addTorus() {
    var mesh = Primitives.createTorus(this._gl, this._torusLength, this._torusWidth, this._torusRadius, this._torusRadial, this._torusTubular);
    if (!this._mesh)
      this.addMesh(mesh, false);
    else
      this.addMesh(mesh, true);
  }

  addMeshPreview(primitive) {
    if (primitive === undefined) {
      if (this._meshPreview) {
        this._meshPreview.release();
        this._meshPreview = null;
        this.render();
      }
      return;
    }

    if (!this._meshPreview) {
      this._meshPreview = new MeshStatic(this._gl);
      this._meshPreview.setRenderData(new RenderData(this._gl, this._meshPreview));
      this._meshPreview.initRender();
    }

    if (primitive === Enums.Mesh.SPHERE) {
      this._meshPreview.createSphere();
    } else if (primitive === Enums.Mesh.CUBE) {
      this._meshPreview.createCube();
    } else if (primitive === Enums.Mesh.CYLINDER) {
      this._meshPreview.createCylinder();
    } else if (primitive === Enums.Mesh.TORUS) {
      this._meshPreview.createTorus(this._torusLength, this._torusWidth, this._torusRadius, this._torusRadial, this._torusTubular);
    }
    this._meshPreview.normalizeSize();
    this._meshPreview.computeCenter();
    this._meshPreview.updateMatrices(this._camera);
    this.render();
  }

  loadScene(fileData, fileType, autoMatrix) {
    var opts = getOptionsURL();
    if (autoMatrix === undefined) autoMatrix = opts.scalecenter;

    this._stateManager.resetState();
    this._meshes.length = 0;
    this._selectMeshes.length = 0;
    this._mesh = null;

    Import[Import.getFileType(fileType)](this, fileData, autoMatrix);
    this.render();
  }

  loadSceneAfterMeshesLoaded(meshes, autoMatrix) {
    if (!meshes || meshes.length === 0)
      return;

    var newMeshes = [];
    for (var i = 0, l = meshes.length; i < l; ++i) {
      var mesh = meshes[i];
      if (!mesh) continue;
      mesh.normalizeSize();
      mesh.computeCenter();
      newMeshes.push(mesh);
    }

    if (autoMatrix !== false) {
      this.normalizeAndCenterMeshes(newMeshes);
    }

    this._meshes = newMeshes;
    this._selectMeshes = newMeshes.slice(0, 1);
    this._mesh = newMeshes[0];
    this._gui.updateMesh();

    this.render();
  }

  saveSceneAsBinary() {
    return this._stateManager.exportSGL();
  }

  getFileType(fileName) {
    var match = fileName.toLowerCase().match(/\.([^.]*)$/);
    if (!match || !match[1])
      return null;
    return match[1];
  }

  getVertexColorSpace() {
    return this._vertexSRGB ? 'srgb' : 'linear';
  }

  computeBoundingBox() {
    var meshes = this._meshes;
    var bound = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (var i = 0, l = meshes.length; i < l; ++i) {
      var bi = meshes[i].computeWorldBound();
      if (bi[0] < bound[0]) bound[0] = bi[0];
      if (bi[1] < bound[1]) bound[1] = bi[1];
      if (bi[2] < bound[2]) bound[2] = bi[2];
      if (bi[3] > bound[3]) bound[3] = bi[3];
      if (bi[4] > bound[4]) bound[4] = bi[4];
      if (bi[5] > bound[5]) bound[5] = bi[5];
    }
    return bound;
  }

  getCounterTriangles() {
    var sumTris = 0;
    for (var i = 0, l = this._meshes.length; i < l; ++i)
      sumTris += this._meshes[i].getNbTriangles();
    return sumTris;
  }

  getCounterVertices() {
    var sumVertices = 0;
    for (var i = 0, l = this._meshes.length; i < l; ++i)
      sumVertices += this._meshes[i].getNbVertices();
    return sumVertices;
  }

  isDarkenUnselected() {
    return ShaderLib[Enums.Shader.PBR].darkenUnselected;
  }

  getScaleAndCenter() {
    return this._autoMatrix;
  }

  setScaleAndCenter(bool) {
    this._autoMatrix = bool;
  }

  setExportTexture(bool) {
    RenderData.EXPORT_TEX_COORDS = bool;
  }

  createPrimitive() {
    var mesh = this._meshPreview;
    if (!mesh) return;

    mesh.normalizeSize();
    if (this._autoMatrix) this.normalizeAndCenterMeshes([mesh]);
    mesh.initRender();
    this.addMesh(mesh, false);

    this._meshPreview = null;
    this.render();
  }
}

export default Scene;
