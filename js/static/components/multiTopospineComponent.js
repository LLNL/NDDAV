/*
 - control simplification of two function separately
 - update the choice of the comparison functions separately
*/

class multiTopospineComponent extends topospineComponent {
  constructor(uuid) {
    super(uuid);
  }

  initTopoPlot() {
    console.log("########## multiTopoSpineComponent class ###########");
    this.addModule("MultiEGModule", ['EGgraph', 'subselection',
      'EGgraphCompare'
    ]);
    // this.registerSignal("graph");
    this.topoPlot = new multiTopoSpinesPlot(this.getDiv());
    this.topoPlot.setComputationCallback(this.computeTopoSpine.bind(
      this));
    this.topoPlot.setComputeCmpSpineCallback(this.computeTopoSpineCmp.bind(
      this));
    this.topoPlot.setSelectionCallback(this.selectExtrema.bind(this));
    this.topoPlot.setUpdateFuncCallback(this.updateFunction.bind(this));
    this.topoPlot.setUpdateCmpFuncCallback(this.updateCmpFunction
      .bind(this));
  }

  parseSignalCallback(msg) {
    // console.log(msg);
    super.parseSignalCallback(msg);

    if (msg['signal'] === 'EGgraphCompare') {
      // console.log("EGgraphCompare is updated\n");
      var persistence = msg['data']['persistence'];
      var variation = msg['data']['variation'];
      //init/update persistence plot
      this.topoPlot.setCmpPersistence(persistence, variation);
    }
  }

  parseFunctionReturn(msg) {
    super.parseFunctionReturn(msg);

    if (msg['function'] === "computeCmpSpineJSON") {
      var spineCmp = JSON.parse(msg['data']);
      // console.log("parse computeTopoSpineCmp:", spineCmp);

      this.topoPlot.setCmpData(spineCmp);
    }
  }

  /////// customized function ///////
  updateCmpFunction() {
    var dimName = this.topoPlot.getCmpDimName();
    this.callModule("updateCmpFunction", {
      "dimensionName": dimName
    });
  }

  //change
  computeTopoSpineCmp(persistence, variation) {
    this.callModule("computeCmpSpineJSON", {
      "persistence": persistence,
      "variation": variation
    });
  }
}
