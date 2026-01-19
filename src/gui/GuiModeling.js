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
    this._ctrlSelectMode = null;
    this._ctrlSelectAction = null;

    this.init(guiTopbar, guiSidebar);
  }

  init(guiTopbar, guiSidebar) {
    this._menuTop = guiTopbar.addMenu(TR('modelingTitle'));
    this._ctrlMode = this._menuTop.addCheckbox(TR('modelingMode'), false, this.onToggle.bind(this));

    this._menuSide = guiSidebar.addMenu(TR('modelingSidebarTitle'));
    this._menuSide.close();

    this._menuSide.addTitle(TR('modelingSelectionTitle'));
    var tool = this._sculptManager.getTool(Enums.Tools.ELEMENTSELECT);
    var modeOptions = [];
    modeOptions[tool.constructor.Mode.VERTEX] = TR('sculptElementSelectVertex');
    modeOptions[tool.constructor.Mode.EDGE] = TR('sculptElementSelectEdge');
    modeOptions[tool.constructor.Mode.FACE] = TR('sculptElementSelectFace');

    var actionOptions = [];
    actionOptions[tool.constructor.Action.REPLACE] = TR('sculptElementSelectReplace');
    actionOptions[tool.constructor.Action.ADD] = TR('sculptElementSelectAdd');
    actionOptions[tool.constructor.Action.REMOVE] = TR('sculptElementSelectRemove');

    this._ctrlSelectMode = this._menuSide.addCombobox(TR('modelingSelectionMode'), tool._selectionMode, function (val) {
      tool._selectionMode = val;
    }, modeOptions);
    this._ctrlSelectAction = this._menuSide.addCombobox(TR('modelingSelectionAction'), tool._selectionAction, function (val) {
      tool._selectionAction = val;
    }, actionOptions);

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
