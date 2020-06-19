class summaryparallelcoordinatesComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);

    this.addModule("SumParallelCoordinateModule", ['sumdata', 'curPC',
      'globalMinMax', 'selectPC', 'selectExt'
    ]);

    this.spc = new summaryparallelcoordinatesPlot(this.getDiv());
    this.spc.setBrushCallback(this.selectionCallback.bind(this));
    this.spc.bindSelectPCCallback(this.selectPC.bind(this));
    // this.spc.bindSelectPCCallback(this.selectPC.bind(this));

  }

  parseSignalCallback(msg) {
    if (msg['signal'] === 'sumdata') {
      // Set Global Histogram
      var curdata = msg['data']['data'];
      var ranges = msg['data']['range'];
      var comb = msg['data']['comb'];
      // console.log(curdata);
      this.spc.setSum(curdata, ranges, comb);
      // var testscale = {"f":[-10,50]};
      // this.spc.setScale(testscale);
    } else if (msg['signal'] === 'curPC') {
      var msgg = msg['data']['data'];
      if (msgg != null) {
        this.spc.setSegs(msgg);
      }
    }
    // else if (msg['signal'] === 'brushedrange') {
    //     var brushed = msg['data']['data'];
    // }
    else if ((msg['signal'] === 'selectExt') && (msg['data']['data'] === -1)) {
      // restore by to summary data
      this.spc.setSegs();
    } else if (msg['signal'] === 'globalMinMax') {
      var globalMinMax = msg['data']['data'];
      this.spc.setScale(globalMinMax);
    }
  }

  parseFunctionReturn(msg) {

  }

  resize() {
    this.spc.resize();
  }

  selectionCallback(brushed) {
    this.setSignal("brushedrange", brushed);
  }

  selectPC(dim) {
    this.setSignal("selectPC", dim);
    //console.log("inceissss", indices);
  }

  //brush(){

  //}

  draw() {
    this.spc.draw();
  }
}
