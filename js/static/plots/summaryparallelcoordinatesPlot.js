class summaryparallelcoordinatesPlot extends basePlot {
  constructor(div) {
    console.log("Sum PC Constructed !!!!!!!!!!!!!!!!!!!!!")
      // this._div = '#' + div;
      // this._divTag = div;
    super(div);

    this.margin = {
      top: 30,
      right: 20,
      bottom: 30,
      left: 20
    };

    //this.densityScale = 50;
    this.gamma = 0.5;

    this.width = 600;
    this.height = 600;
    this.currentSubselect = 0;

    this.brushFunction = null;
    this.drawBackground = false;
    this.scale = {};
  }

  setSum(data, ranges, comb) {
    // raw data for everything
    this.raw = data;
    this.ranges = {};
    this.data = [];
    this.comb = comb;
    //console.log(this.raw);

    var ind = -1;

    var curk;
    for (var i of ranges) {
      if (typeof i === 'string') {
        this.ranges[i] = [];
        curk = i;
        ind++;
        this.data.push([]);
      } else {
        this.ranges[curk].push(i);
        this.data[ind].push(i);
      }
    }

    this.names = Object.keys(this.ranges);

    this.sum = [];

    for (var dim = 0; dim < this.names.length - 1; dim++) {
      var dimf = this.names[dim] + '$' + this.names[dim + 1];
      var dimr = this.names[dim + 1] + '$' + this.names[dim];
      //console.log(this.comb[dimf])
      if (dimf in this.comb) {
        //console.log(this.raw[this.comb[dimf]])
        this.sum.push(this.raw[this.comb[dimf]])
      } else if (dimr in this.comb)
        this.sum.push(this.raw[this.comb[dimr]])
    }

    var total = this.names.length;

    this.selectpcCallback(total);
    //console.log("sum end = ", this.sum)
    this._generatePlotData();
    this.draw();

  }
  setSegs(segs) {
      this.segs = segs;
      this.draw();
    }
    // resetSegs(){
    //   this.segs = undefined;
    //   this.draw();
    // }

  bindSelectPCCallback(func) {
    this.selectpcCallback = func;
  }

  setPts(data) {
    this.pts = {};
    for (var i of data) {
      var k = i[0];
      i.shift();
      this.pts[k] = i;
    }

  }

  setScale(inputScale = {}) {
    this.scale = inputScale;
    this.draw();
  }

  // resetScale(){
  //   this.scale = {};
  //   this.draw();
  // }

  draw() {
    //
    var data;
    // debugger;
    if ((this.segs != undefined) && (this.segs[0].length === 1))
      return

    if ((this.segs === undefined))
      data = this.sum;
    else
      data = this.segs;

    if (this._isValid()) {
      // this.curdata = data;
      d3.select(this._div).style("position", "absolute");

      //add top svg
      //determine whether this.draw function is called

      if (this.currentAxis === undefined) {
        // console.log("init draw \n", this.currentAxis);
        d3.select(this._div).html(""); //cleanup
        this.svg = d3.select(this._div).append("svg")
          .attr('width', $(this._div).parent().width())
          .attr('height', $(this._div).parent().height());

        this.currentAxis = 0;
        //console.log(this);
        // this.vSelector =
        //   new d3UIitemSelector(this.svg, this.names, this.currentAxis, [
        //     200,
        //     20
        //   ]);

        // this.colorMap =
        // new d3UIcolorMap(this.svg, "parallelCoodColorBar" +
        //   this._divTag, d3.extent(
        //     this.data[this.currentAxis]), [
        //     20, 20
        //   ]);

        this.denseSlider =
          new d3UIslider(this.svg, "Gamma", [0, 100], this
            ._sliderOffset(), this._sliderSize(), this.gamma * 100, 100); //.attr("class","?????????");
        //d3.select(this.denseSlider).attr("class", "denseSlider");
        this.denseSlider.callback(this.test.bind(this));

        var checkBox1 = new d3CheckBox();

        //Just for demonstration
        //var txt = this.svg.append("text").attr("x", 10).attr("y", 80).text("Draw Background");
        var updateF = () => { //function () {
          var checked1 = checkBox1.checked();
          this.drawBackground = checked1;
          this.draw();
          this._rehighlight();
          //console.log("Update =", this.drawBackground);
        };

        //Setting up each check box
        checkBox1.size(15).x(200).y(10).markStrokeWidth(1).boxStrokeWidth(1).checked(
          this.drawBackground).clickEvent(updateF);
        this.svg.call(checkBox1);
        this.svg.append("text").attr("x", 220).attr("y", 20).text(
          "Draw Background").attr('font-size', '10pt');

        // this.denseSlider =
        //     new d3UIslider(this.svg, "DensityScale", [15, 100], this
        //         ._sliderOffset(), this._sliderSize(), 40);//.attr("class","?????????");
        // //d3.select(this.denseSlider).attr("class", "denseSlider");
        // this.denseSlider.callback(this.test.bind(this));

        d3.select(this._div + "pcDiv").remove();

        d3.select(this._div)
          .append("div")
          .attr("id", this._divTag + "pcDiv")
          .attr("class", "parcoords")
          .style("position", 'absolute')
          // .style("background-color", "transparent")
          .style("top", '45px')
          .style("left", '0px')
          .style("width", $(this._div).parent().width() + 'px')
          .style("height", ($(this._div).parent().height() - 45) +
            'px');

      } else {
        //readjust size
        this.svg = d3.select(this._div).select("svg")
          .attr('width', $(this._div).parent().width())
          .attr('height', $(this._div).parent().height());
      }

      //cleanup
      // This Remove the old plot, it s
      // d3.select(this._div + "pcDiv").remove();

      // d3.select(this._div)
      //   .append("div")
      //   .attr("id", this._divTag + "pcDiv")
      //   .attr("class", "parcoords")
      //   .style("position", 'absolute')
      //   // .style("background-color", "transparent")
      //   .style("top", '45px')
      //   .style("left", '0px')
      //   .style("width", $(this._div).parent().width() + 'px')
      //   .style("height", ($(this._div).parent().height() - 45) +
      //     'px');
      // var temp = d3.select(this._div).data([1]);//
      // console.log(temp);
      // temp.enter().append("div").merge(temp).attr("id", this._divTag + "pcDiv")
      // d3.select(this._div).enter().append("div")

      d3.select(this._div + "pcDiv")
        .attr("class", "parcoords")
        .style("position", 'absolute')
        // .style("background-color", "transparent")
        .style("top", '45px')
        .style("left", '0px')
        .style("width", $(this._div).parent().width() + 'px')
        .style("height", ($(this._div).parent().height() - 45) +
          'px');

      // this.colorMap.callback(this.redraw.bind(this));
      // this.vSelector.callback(this.updateAxis.bind(this));
      // console.log(data);
      var maxRow = data.map(function(row) {
        return Math.max.apply(Math, row);
      });
      var maxBinVal = Math.max(...maxRow);
      console.log(maxRow);
      console.log(maxBinVal);

      this.spc = parallel(0, this.gamma)(this._div + "pcDiv")
        .data(this.plotData)
        .all_brush(this.brushFunction)
        // .color(d => this.colorMap.lookup(d[this.names[this.currentAxis]])) // quantitative color scale
        .margin({
          top: 20,
          left: 0,
          right: 0,
          bottom: 20
        })
        .alpha(this.plotData)
        // .maxBin(maxBinVal)
        // render both foreground and background
        .render(data, this.sum, this.drawBackground, this.scale)
        .brushMode("1D-axes") // enable brushing
        //.interactive() // command line mode
        //.reorderable();

      // keep track of brushedState
      if (!this.brushFunction)
        this.brushFunction = this.spc.brushHelp();
      //register brush event

      // console.log("plot:", this.plotData);

      this.spc.on("brushend", brushed => {

        // NEED TO KNOW THE AXIS BRUSHED IN ORDER TO PROJECT TO Funciton Value

        var cur_brushed = {};

        for (var i = 0; i < brushed[0].length; i++) {
          cur_brushed[brushed[0][i]] = brushed[1][i];
        }

        this.callback(cur_brushed);


        // var indices = brushed.map(d => {
        //   //console.log(d);
        //   //return d['index']
        //   return d;
        // });

        // // Final indices will return the final range for brushed area

        // console.log('-----\n', indices, '-----\n');
        // hack

        // Do something with the brushed range here

        // console.log(this.plotData);

        // if (indices.length === this.plotData.length) {
        //     this.callback([]);
        //     this.currentSubselect = 0;
        // } else {
        //     // console.log(this, this.callback)
        //     if (this.callback) {
        //         this.currentSubselect = indices.length;
        //         this.callback(indices);
        //     }
        // }
      });

      // this.pc.on("clear")

    }
  }

  test() {
    //console.log(this.denseSlider.value())
    //this.densityScale = this.denseSlider.value();
    this.gamma = this.denseSlider.value() / 100;
    //console.log(this.gamma);
    this.draw();
    this._rehighlight();

  }
  setBrushCallback(callback) { //brushdim, brushrange){//callback) {
    // this.callback = callback;
    //console.log(brushdim, brushrange);
    this.callback = callback;
  }

  resize() {
    this.draw();
    this._rehighlight();
  }

  update(index) {
    if (index.length != 1 && this.ext[index[0]] != undefined)
      this.draw(this.segs[this.ext[index[0]]]);
    // Will Think about this part, when to unhighlight
    else if (index.length === 1)
      this.draw();

    //console.log('Will draw highlighted pts here')
  }

  highlight(listOfIndex = []) {

    if (this._isValid()) {
      // this.pc.brushReset();
      // console.log("=========reset brush===========");
      if (listOfIndex.length === 0) {
        if (this.highlightItems) {
          this.spc.unhighlight(this.highlightItems);
          this.highlightItems = undefined;
        }

        // this.pc.clear("highlight");
        // this.pc.clear("foreground");
      } else {
        this.highlightItems = listOfIndex.map(d => {
          if (d >= 0)
            return this.plotData[d];
        });
        this.spc.highlight(this.highlightItems);
      }
    }
  }


  redraw(colormap) {
    this.spc.render(this.segs);
    this._rehighlight();
  }

  updateAxis(index) {
    this.currentAxis = index;
    // this.colorMap.range(d3.extent(this.data[this.currentAxis]));
    this.spc.render(this.segs);
  }

  _generatePlotData() {

    this.plotData = this.data[0].map((_, i) => {
      var obj = {};
      this.data.forEach((d, j) => {
        //console.log(d);
        //console.log(j);
        obj[this.names[j]] = d[i];
      });
      //obj["index"] = i;
      return obj;
    });

  }

  _rehighlight() {
    if (this.highlightItems)
      this.spc.highlight(this.highlightItems);
  }

  _isValid() {
    return this.data && !d3.select(this._div).empty();
  }

  _sliderOffset() {
    return [50, -5];
  }

  _sliderSize() {
    return [180, 100];
  }

}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}
