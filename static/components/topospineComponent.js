class topospineComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    console.log(this.uuid);
    this.initTopoPlot();
  }

  initTopoPlot() {
    this.addModule("EGModule", [], false);
    this.addModule("TopospineModule", ['EGgraph', 'subselection', 'selectExt',
      'brushedrange'
    ]);

    this.topoPlot = new topospinesPlot(this.getDiv());
    this.topoPlot.setComputationCallback(this.computeTopoSpine.bind(
      this));
    this.topoPlot.setSelectionCallback(this.selectExtrema.bind(this));
    this.topoPlot.setUpdateFuncCallback(this.updateFunction.bind(
      this));
    this.topoPlot.setHoverFuncCallback(this.hoverExtrema.bind(this));
  }

  parseSignalCallback(msg) {
    // console.log("Spine msg:", msg);
    // console.log("signal: ", msg['signal']);
    if (msg['signal'] === 'EGgraph') {
      console.log("Signal EG, data attr:", msg['data']);
      var persistence = msg['data']['persistence'];
      var variation = msg['data']['variation'];
      //init/update persistence plot
      this.topoPlot.setPersistence(persistence, variation);
      // this.initScale = this.topoPlot.scale();
      // Old
      //} else if (msg['signal'] === 'subselection') {
    } else if (msg['signal'] === 'subselection') {

      var listOfIndex = msg['data']['data'];
      // console.log(listOfIndex);

      if (listOfIndex.length > 1)
        this.callModule("computeSelectionSpineJSON");
    } else if (msg['signal'] === 'selectExt') {
      if (msg['data']['data'] === -1) {

        var contourScale = this.topoPlot.scale();
        // console.log("contourScale", contourScale);

        //console.log(contourScale, this.topoPlot.pPlot.getCurrentPersistence(), this.topoPlot.pPlot.getCurrentVariation());
        if (this.topoPlot.pPlot.getCurrentPersistence() != undefined) {
          this.callModule("computeTopoSpineJSON", {
            "persistence": this.topoPlot.pPlot.getCurrentPersistence(),
            "variation": this.topoPlot.pPlot.getCurrentVariation(),
            "layoutType": 'graph',
            "scale": contourScale
          });
        }
      }
    } else if (msg['signal'] === 'brushedrange') {

      var cur_brush = msg['data']['data'];

      if (Object.keys(cur_brush).length > 0)
        this.callModule("computeSelectionSpineJSON");
      else { // maybe restore back to selection spine?
        var contourScale = this.topoPlot.scale();

        if (this.topoPlot.pPlot.getCurrentPersistence() != undefined) {
          this.callModule("computeTopoSpineJSON", {
            "persistence": this.topoPlot.pPlot.getCurrentPersistence(),
            "variation": this.topoPlot.pPlot.getCurrentVariation(),
            "layoutType": 'graph',
            "scale": contourScale
          });
        }
      }
    }
  }

  parseFunctionReturn(msg) {
    if (msg['function'] === "computeTopoSpineJSON") {
      var spineData = JSON.parse(msg['data']);
      this.topoPlot.setData(spineData);
      // If new scale is different from intial scale, need to regenerate spine data
      if (this.topoPlot.checkScale()) {

        this.callModule("computeTopoSpineJSON", {
          "persistence": this.topoPlot.pPlot.getCurrentPersistence(),
          "variation": this.topoPlot.pPlot.getCurrentVariation(),
          "layoutType": 'graph',
          "scale": this.topoPlot.scale()
        });
      }

    } else if (msg['function'] === "computeSelectionSpineJSON") {
      var spineData = JSON.parse(msg['data']);
      if (spineData !== "") {
        // console.log("SPINEData", spineData);
        this.topoPlot.setData(spineData);
      }
    }
  }

  resize() {
    // console.log("spine size event\n");
    // console.log(this.spineData);
    this.topoPlot.resize();
  }

  /////// customized function ///////

  updateFunction() {
    var dimName = this.topoPlot.getCurrentDimName();
    console.log("updateFunction", dimName);
    this.callModule("updateFunction", {
      "dimensionName": dimName
    })
  }

  //change the simplification level
  computeTopoSpine(peristence, variation) {
    var layoutType = this.topoPlot.layoutType();
    var contourScale = this.topoPlot.scale();
    // console.log("contourScale", contourScale);
    this.callModule("computeTopoSpineJSON", {
      "persistence": peristence,
      "variation": variation,
      "layoutType": layoutType,
      "scale": contourScale
    });
    // console.log("contourScale", this.topoPlot.scale());
  }

  selectExtrema(index) {
    // console.log("selectExtrema:", index);
    // It is called here to update Spine
    this.callModule("subselectSegmentByExtremaIndex", {
      "index": index
    });
    //this.setSignal("selectExt", index);
    //console.log("set Ext to ", index)
  }

  hoverExtrema(index) {
    this.callModule("subselectExtrema", {
      "index": index
    });
    // this.setSignal("highlight", index);
  }
}
