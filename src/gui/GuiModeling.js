import TR from 'gui/GuiTR';
import Enums from 'misc/Enums';

class GuiModeling {

  constructor(guiTopbar, guiSidebar, ctrlGui) {
    this._main = ctrlGui._main;
    this._ctrlGui = ctrlGui;
    this._sculptManager = ctrlGui._main.getSculptManager();
    this._isEnabled = false;

    this._menuTop = null;
    this._menuSide = null;
    this._ctrlMode = null;
    this._ctrlSelectVertex = null;
    this._ctrlSelectEdge = null;
    this._ctrlSelectFace = null;
    this._ctrlActionReplace = null;
    this._ctrlActionAdd = null;
    this._ctrlActionRemove = null;

    this.init(guiTopbar, guiSidebar);
  }

  init(guiTopbar, guiSidebar) {
    this._menuTop = guiTopbar.addMenu(TR('modelingTitle'));
    this._ctrlMode = this._menuTop.addCheckbox(TR('modelingMode'), false, this.onToggle.bind(this));

    this._menuSide = guiSidebar.addMenu(TR('modelingSidebarTitle'));
    this._menuSide.close();

    this._menuSide.addTitle(TR('modelingSelectionTitle'));
    var tool = this._sculptManager.getTool(Enums.Tools.ELEMENTSELECT);
    this._ctrlSelectVertex = this._menuSide.addCheckbox(TR('modelingSelectVertex'), tool._selectionMode === tool.constructor.Mode.VERTEX, function () {
      this.setSelectionMode(tool.constructor.Mode.VERTEX);
    }.bind(this));
    this._ctrlSelectEdge = this._menuSide.addCheckbox(TR('modelingSelectEdge'), tool._selectionMode === tool.constructor.Mode.EDGE, function () {
      this.setSelectionMode(tool.constructor.Mode.EDGE);
    }.bind(this));
    this._ctrlSelectFace = this._menuSide.addCheckbox(TR('modelingSelectFace'), tool._selectionMode === tool.constructor.Mode.FACE, function () {
      this.setSelectionMode(tool.constructor.Mode.FACE);
    }.bind(this));

    this._menuSide.addTitle(TR('modelingSelectionAction'));
    this._ctrlActionReplace = this._menuSide.addCheckbox(TR('modelingActionReplace'), tool._selectionAction === tool.constructor.Action.REPLACE, function () {
      this.setSelectionAction(tool.constructor.Action.REPLACE);
    }.bind(this));
    this._ctrlActionAdd = this._menuSide.addCheckbox(TR('modelingActionAdd'), tool._selectionAction === tool.constructor.Action.ADD, function () {
      this.setSelectionAction(tool.constructor.Action.ADD);
    }.bind(this));
    this._ctrlActionRemove = this._menuSide.addCheckbox(TR('modelingActionRemove'), tool._selectionAction === tool.constructor.Action.REMOVE, function () {
      this.setSelectionAction(tool.constructor.Action.REMOVE);
    }.bind(this));

    this._menuSide.addButton(TR('sculptElementSelectAll'), tool, 'selectAll');
    this._menuSide.addButton(TR('sculptElementSelectClear'), tool, 'clearSelection');
    this._menuSide.addButton(TR('sculptElementSelectInvert'), tool, 'invertSelection');

    this._menuSide.addTitle(TR('modelingToolsTitle'));
    this._menuSide.addButton(TR('modelingExtrude'), this, 'notImplemented');
    this._menuSide.addButton(TR('modelingDelete'), this, 'notImplemented');
    this._menuSide.addButton(TR('modelingFill'), this, 'notImplemented');
    this._menuSide.addButton(TR('modelingBridge'), this, 'notImplemented');
    this._menuSide.addButton(TR('modelingKnife'), this, 'notImplemented');
    this._menuSide.addButton(TR('modelingLoopCut'), this, 'notImplemented');
  }

  notImplemented() {
    window.alert(TR('modelingNotImplemented'));
  }

  setSelectionMode(mode) {
    var tool = this._sculptManager.getTool(Enums.Tools.ELEMENTSELECT);
    tool._selectionMode = mode;
    this._ctrlSelectVertex.setValue(mode === tool.constructor.Mode.VERTEX, true);
    this._ctrlSelectEdge.setValue(mode === tool.constructor.Mode.EDGE, true);
    this._ctrlSelectFace.setValue(mode === tool.constructor.Mode.FACE, true);
  }

  setSelectionAction(action) {
    var tool = this._sculptManager.getTool(Enums.Tools.ELEMENTSELECT);
    tool._selectionAction = action;
    this._ctrlActionReplace.setValue(action === tool.constructor.Action.REPLACE, true);
    this._ctrlActionAdd.setValue(action === tool.constructor.Action.ADD, true);
    this._ctrlActionRemove.setValue(action === tool.constructor.Action.REMOVE, true);
  }

  onToggle(value) {
    this._isEnabled = value;
    this._ctrlGui.setModelingMode(value);
    if (value) {
      this._sculptManager.setToolIndex(Enums.Tools.ELEMENTSELECT);
      this._main.getPicking().updateLocalAndWorldRadius2();
      this._main.render();
    }
  }

  updateMesh(isModelingMode) {
    this._isEnabled = isModelingMode;
    var visible = isModelingMode && !!this._main.getMesh();
    this._menuSide.setVisibility(visible);
  }
}

export default GuiModeling;
