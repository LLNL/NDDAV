class summaryscatterplotsComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    this.addModule("SumScatterPlotModule", ['sumdata', 'subselection',
      'curSP', 'selectExt', 'globalMinMax'
      // , 'selectSP', 'selectExt'
    ]);
    this.sPlot = new summaryscatterplots(this.getDiv());
    this.sPlot.bindSelectionCallback(this.selection.bind(this));
    this.sPlot.bindSubselectionCallback(this.subselection.bind(this));
    this.sPlot.bindSelectSPCallback(this.selectSP.bind(this));

    this._setInteraction();
  }

  parseSignalCallback(msg) {
    if (msg['signal'] === 'sumdata') {
      var curdata = msg['data']['data'];
      var ranges = msg['data']['range'];
      var comb = msg['data']['comb'];
      //console.log(ranges, comb);
      this.sPlot.setSum(curdata, ranges, comb)
      //var testscale = {"f":[-10,50]};
      //this.sPlot.setScale(testscale);
    } 
    else if (msg['signal'] === 'subselection') {

      var listOfIndex = msg['data']['data'];
      //console.log(listOfIndex);
      //if (listOfIndex.length > 1)
      //  this.sPlot.updateHighlight(listOfIndex);
    }

    else if (msg['signal'] === 'curSP') {
      var curseg = msg['data']['data'];
      // var ext = msg['data']['ext'];
      // var comb = msg['data']['comb'];

      if (curseg != null)
        this.sPlot.setSeg(curseg); //, ext, comb);
    }
    else if ((msg['signal'] === 'selectExt') && (msg['data']['data']===-1) ){
        // console.log("Need to draw global here");
        this.sPlot.setSeg();
    }
    else if (msg['signal'] === 'globalMinMax') {
      var globalMinMax = msg['data']['data'];
      this.sPlot.setScale(globalMinMax);
    }
  }

  resize() {
    this.sPlot.resize();
  }

  parseFunctionReturn(msg) {

  }

  selection(index) {
    this.setSignal("subselection", [index]);
  }

  subselection(listOfIndex) {
    this.setSignal("subselection", listOfIndex);
  }

  selectSP(indices) {
    this.setSignal("selectSP", indices);
    //console.log("inceissss", indices);
  }

  setDim(x, y, z) {
    // console.log(domain, range, norm);
    this.callModule("setDim", {
      "x": x,
      "y": y,
      "z": z
    });
  }

  _setInteraction() {
    d3.select

  }
}
