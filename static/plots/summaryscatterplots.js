///////////// scatterplot matrix /////////////
class summaryscatterplots extends basePlot {
  constructor(div, renderMode = "Scalable", plotType = 'single') {
    super(div);

    this.renderMode = renderMode; //'canvas' or 'd3'
    this.plotType = plotType; //'matrix' or 'single'
    this.plots = [];
    this.margin = {
      top: 50,
      right: 20,
      bottom: 55,
      left: 60
    };
    this.width = 600;
    this.height = 600;
    this.listOfIndex = [-1];
    // this.densityScale = 50;
    this.gamma = 0.2;
    this.A = 1;
    this.scale = {};
  }

  setData(data, names, domain = [0, 1], values = [2]) {
    this.data = data;
    this.names = names;
    this.xIndex = domain[0];
    this.yIndex = domain[1];
    this.vIndex = values[0];
    this.selectpcCallback([this.xIndex, this.yIndex]);
    this.draw();
  }

  setSum(data, ranges, comb, domain = [0, 1], values = [2]) {

    //console.log(data, ranges, comb);
    this.comb = comb;
    this.raw = data;
    this.ranges = {};
    this.data = []; // Stores the mean hist value
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


    this.xIndex = domain[0];
    this.yIndex = domain[1];
    this.vIndex = values[0];

    //var indices = this.find_index(this.names[this.xIndex],this.names[this.yIndex]);


    // this.sum = this.raw[indices[0]];

    this.draw();

  }

  setSeg(segs) {
    this.segs = segs;
    this.draw();
  }

  // setSeg(segs) {
  //   this.segs = segs;
  //   this.draw();
  // }

  // resetSeg(){
  //   this.segs = undefined;
  //   this.draw();
  // }
  setScale(scale = {}) {
    this.scale = scale;
    this.draw();
  };

  // resetScale(){
  //   this.scale = {};
  //   this.draw();
  // }

  setPts(data) {
      this.Pts = {};
      for (var i of data) {
        var k = i[0];
        i.shift();
        this.Pts[k] = i;
      }
      // Will think about how to use later


    }
    // setSeg(seg) {
    //     if (this._isValid()) {
    //         var c10 = d3.scale.category10();
    //         this.svg.selectAll("circle")
    //             .style("fill", (d, i) => c10(seg[i]));
    //         this.vSelector.setTempLabel("class");
    //     }
    // }

  bindSelectionCallback(func) {
    this.selectionCallback = func;

  }

  bindSubselectionCallback(func) {
    this.subselectionCallback = func;
  }

  bindSelectSPCallback(func) {
    this.selectpcCallback = func;
  }

  drawSPLOM() {

  }

  drawScalable() {

    var marks = this.data;
    // console.log(this.data);
    var indices;
    var order;
    var data;
    if ((this.segs === undefined) && (marks) === undefined)
      return
    else if (this.segs === undefined) { //((this.seg === undefined) || (this.segs === undefined)) {
      indices = this.find_index(this.names[this.xIndex], this.names[this.yIndex]);
      data = this.raw[indices[0]]; //this.sum;
      // need to store global somewhere
      order = indices[1];
    } else {
      indices = this.find_index(this.names[this.xIndex], this.names[this.yIndex]);
      data = this.segs; //seg[indices[0]];//this.sum;
      order = indices[1];
    }

    if (this._isValid()) {

      this._updateWidthHeight();

      this.plotData = zip([this.data[this.xIndex],
        this.data[this.yIndex],
        this.data[this.vIndex]
      ]);

      // Modify here to preserve a user-defined scale

      // console.log("x = ", this.names[this.xIndex], "y = ", this.names[this.yIndex]);
      var offsetX, offsetY;
      
      if (this.names[this.xIndex] in this.scale) {
        this.x = d3.scale.linear().domain(this.scale[this.names[this.xIndex]])
          .range([0, this.width]);
        offsetX = [this.scale[this.names[this.xIndex]], d3.extent(this.plotData,
          d => d[0])];
      } else {
        this.x = d3.scale.linear().domain(d3.extent(this.plotData, d =>
          d[0])).range([0, this.width]);
      }

      
      if (this.names[this.yIndex] in this.scale) {
        this.y = d3.scale.linear().domain(this.scale[this.names[this.yIndex]])
          .range(
            [this.height, 0]);
        offsetY = [this.scale[this.names[this.yIndex]], d3.extent(this.plotData,
          d => d[1])];
      } else {
        this.y = d3.scale.linear().domain(d3.extent(this.plotData, d =>
          d[1])).range([this.height, 0]);
      }

      this.xAxis = d3.svg.axis().scale(this.x).orient('bottom').tickFormat(
        d3.format(".2f"));
      this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickFormat(
        d3.format(".2f"));

      //cleanup
      d3.select(this._div).select("svg").remove();


      // Create an object for canvas layers
      var canvas2 = d3.select(this._div)
        .append('canvas')
        .attr('width', this.pwidth)
        .attr('height', this.pheight)
        .attr('transform', 'translate(' + this.margin.left + "," +
          this.margin.top + ")").attr('class', 'scattercvs');

      var canvas = d3.select(this._div)
        .append('canvas')
        .attr('width', this.pwidth)
        .attr('height', this.pheight)
        .attr('transform', 'translate(' + this.margin.left + "," +
          this.margin.top + ")").attr('class', 'scattercvs');



      // Foreground and background pts
      var backctx = canvas2.node().getContext('2d');

      var forectx = canvas.node().getContext('2d');


      this.svg = d3.select(this._div).append("svg")
        .attr('class', 'scattersvg')
        .attr('width', this.pwidth)
        .attr('height', this.pheight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + "," +
          this.margin.top + ")");


      // this.colormap = new d3UIcolorMap(this.svg,
      //     "scatterPlotColorBar" + this._divTag, d3.extent(this.plotData,
      //         d =>
      //             d[2]), this._cmOffset());

      this.denseSlider = new d3UIslider(this.svg, "Gamma", [0, 100], this
        ._sliderOffset(), this._sliderSize(), this.gamma * 100, 100);
      this.denseSlider.callback(this.test.bind(this));

      this.xSelector =
        new d3UIitemSelector(this.svg, this.names, this.xIndex,
          this._xsOffset());
      this.ySelector =
        new d3UIitemSelector(this.svg, this.names, this.yIndex,
          this._ysOffset());
      // this.vSelector =
      //   new d3UIitemSelector(this.svg, this.names, this.vIndex,
      //     this._vsOffset());

      //add axes
      this.svg.append('g').attr('class', 'axis')
        .attr("id", "x-axis")
        .attr('transform', 'translate(0,' + this.height + ")").call(
          this.xAxis);
      this.svg.append('g').attr('class', 'axis')
        .attr("id", "y-axis")
        .attr('class', 'axis').call(this.yAxis);

      // console.log("order = ", order);

      // console.log(data, marks); 
      
      // SR happened

      // if (Math.sqrt(data.length)!=marks[0].length)
      // {
      //   for (var i = 0; i<marks.length; i++)
      //     marks[i] = this.linspace(marks[i][0], marks[i][marks[0].length-1], Math.sqrt(data.length));
      // }  

      // console.log(data, marks); 
      
      this.canvas_render_pts(forectx, backctx, data, marks, this.width, this.height,
        this.margin.left, this.margin.top, order, offsetX, offsetY);


      //
      // var dragBehavior = d3.behavior.drag();
      // var that = this;
      // dragBehavior.on('dragstart', function() {
      //     // console.log(d);
      //     that.selectRectStart = d3.mouse(this);
      //     // d3.event.stopPropagation();
      // });
      //
      // dragBehavior.on('drag', function() {
      //     that.selectRectEnd = d3.mouse(this);
      //
      //     var x = Math.min(that.selectRectStart[0], that.selectRectEnd[
      //         0]);
      //     var y = Math.min(that.selectRectStart[1], that.selectRectEnd[
      //         1]);
      //     var width = Math.abs(that.selectRectStart[0] -
      //         that.selectRectEnd[0]);
      //     var height = Math.abs(that.selectRectStart[1] -
      //         that.selectRectEnd[1]);
      //
      //     d3.select(that._div).select("svg")
      //         .selectAll('.selectRect').remove();
      //     d3.select(that._div).select("svg")
      //         .append('rect')
      //         .attr('x', x)
      //         .attr('y', y)
      //         .attr('width', width)
      //         .attr('height', height)
      //         .attr('class', 'selectRect')
      //         .style('fill', 'none')
      //         .style('stroke', 'lightgrey')
      //         .style('stroke-dasharray', '10,5')
      //         .style('stroke-width', '3');
      //
      //     //compute what point is in the rect
      //     that.listOfIndex = []
      //     that.svg.selectAll(".scatterplotPoints")
      //         .each((d, i) => {
      //             // console.log(d);z
      //             if ( // inner circle inside selection frame
      //             that.margin.left + that.x(d[0]) >=
      //             x &&
      //             that.margin.left + that.x(d[0]) <=
      //             x + width &&
      //             that.margin.top + that.y(d[1]) >= y &&
      //             that.margin.top + that.y(d[1]) <= y +
      //             height
      //             )
      //                 that.listOfIndex.push(i);
      //         });
      //     that.isDragging = true;
      //
      //     //update highlight during drag movement
      //     that.updateHighlight(that.listOfIndex);
      //
      // });
      //
      // dragBehavior.on('dragend', d => {
      //     if (this.isDragging) {
      //         d3.select(that._div).select("svg")
      //             .selectAll('.selectRect').remove();
      //         //update selection
      //         this.subselectionCallback(this.listOfIndex);
      //         this.isDragging = false;
      //     }
      // });
      // d3.select(this._div).select("svg").call(dragBehavior);


      //handle point deselection
      // d3.select(this._div)
      //     .select("svg")
      //     .select('#backgroundRect')
      //     .on("click", d => {
      //
      //         this.listOfIndex = [];
      //         //clear up selection
      //         this.subselectionCallback(this.listOfIndex);
      //         this.selectionCallback(-1);
      //         console.log("background svg is clicked\n");
      //     });

      // this.colormap.callback(this.updateColor.bind(this));
      this.xSelector.callback(this.updateAxisX.bind(this));
      this.ySelector.callback(this.updateAxisY.bind(this));
      // this.vSelector.callback(this.updateValue.bind(this));

      // this.colormap.draw();
    }

  }

  drawD3() {
    if (this._isValid()) {
      this._updateWidthHeight();

      this.plotData = zip([this.data[this.xIndex],
        this.data[this.yIndex],
        this.data[this.vIndex]
      ]);

      this.x = d3.scale.linear().domain(d3.extent(this.plotData, d =>
        d[0])).range(
        [0, this.width]);
      this.y = d3.scale.linear().domain(d3.extent(this.plotData, d =>
        d[1])).range(
        [this.height, 0]);
      this.xAxis = d3.svg.axis().scale(this.x).orient('bottom').tickFormat(
        d3.format(".1f"));
      this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickFormat(
        d3.format(".1f"));

      //cleanup
      d3.select(this._div).select("svg").remove();

      this.svg = d3.select(this._div).append("svg")
        .attr('width', this.pwidth)
        .attr('height', this.pheight)
        .append('g')
        .attr('transform', 'translate(' + this.margin.left + "," +
          this
          .margin.top + ")");

      //create background
      this.svg.append('rect')
        .attr('id', 'backgroundRect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.pwidth)
        .attr('height', this.pheight)
        .attr('fill', 'white');

      this.colormap = new d3UIcolorMap(this.svg,
        "scatterPlotColorBar" + this._divTag, d3.extent(this.plotData,
          d =>
          d[2]), this._cmOffset());
      this.xSelector =
        new d3UIitemSelector(this.svg, this.names, this.xIndex,
          this._xsOffset());
      this.ySelector =
        new d3UIitemSelector(this.svg, this.names, this.yIndex,
          this._ysOffset());
      // this.vSelector =
      //   new d3UIitemSelector(this.svg, this.names, this.vIndex,
      //     this._vsOffset());

      //add axes
      this.svg.append('g').attr('class', 'axis')
        .attr("id", "x-axis")
        .attr('transform', 'translate(0,' + this.height + ")").call(
          this.xAxis);
      this.svg.append('g').attr('class', 'axis')
        .attr("id", "y-axis")
        .attr('class', 'axis').call(this.yAxis);

      //add points


      this.svg.selectAll(".scatterplotPoints")
        .data(this.plotData)
        .enter()
        .append('circle')
        .attr("r", 3.5)
        .attr('cx', d => this.x(d[0]))
        .attr('cy', d => this.y(d[1]))
        .attr('class', "scatterplotPoints")
        .style("fill", d => this.colormap.lookup(d[2]))
        .style('stroke', 'grey')
        .style('stroke-width', 0.5)
        .on("click", (d, i) => {
          d3.event.stopPropagation();
          this.selectionCallback(i);
        });

      var dragBehavior = d3.behavior.drag();
      var that = this;
      dragBehavior.on('dragstart', function() {
        // console.log(d);
        that.selectRectStart = d3.mouse(this);
        // d3.event.stopPropagation();
      });

      dragBehavior.on('drag', function() {
        that.selectRectEnd = d3.mouse(this);

        var x = Math.min(that.selectRectStart[0], that.selectRectEnd[
          0]);
        var y = Math.min(that.selectRectStart[1], that.selectRectEnd[
          1]);
        var width = Math.abs(that.selectRectStart[0] -
          that.selectRectEnd[0]);
        var height = Math.abs(that.selectRectStart[1] -
          that.selectRectEnd[1]);

        d3.select(that._div).select("svg")
          .selectAll('.selectRect').remove();
        d3.select(that._div).select("svg")
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', height)
          .attr('class', 'selectRect')
          .style('fill', 'none')
          .style('stroke', 'lightgrey')
          .style('stroke-dasharray', '10,5')
          .style('stroke-width', '3');

        //compute what point is in the rect
        that.listOfIndex = []
        that.svg.selectAll(".scatterplotPoints")
          .each((d, i) => {
            // console.log(d);z
            if ( // inner circle inside selection frame
              that.margin.left + that.x(d[0]) >=
              x &&
              that.margin.left + that.x(d[0]) <=
              x + width &&
              that.margin.top + that.y(d[1]) >= y &&
              that.margin.top + that.y(d[1]) <= y +
              height
            )
              that.listOfIndex.push(i);
          });
        that.isDragging = true;

        //update highlight during drag movement
        that.updateHighlight(that.listOfIndex);

      });

      dragBehavior.on('dragend', d => {
        if (this.isDragging) {
          d3.select(that._div).select("svg")
            .selectAll('.selectRect').remove();
          //update selection
          this.subselectionCallback(this.listOfIndex);
          this.isDragging = false;
        }
      });
      d3.select(this._div).select("svg").call(dragBehavior);


      //handle point deselection
      d3.select(this._div)
        .select("svg")
        .select('#backgroundRect')
        .on("click", d => {

          this.listOfIndex = [];
          //clear up selection
          this.subselectionCallback(this.listOfIndex);
          this.selectionCallback(-1);
          console.log("background svg is clicked\n");
        });

      this.colormap.callback(this.updateColor.bind(this));
      this.xSelector.callback(this.updateAxisX.bind(this));
      this.ySelector.callback(this.updateAxisY.bind(this));
      // this.vSelector.callback(this.updateValue.bind(this));

      this.colormap.draw();
    }
  }

  draw() {
    if (this.renderMode === "d3") {
      this.drawD3();
    } else if (this.renderMode === "Scalable") {
      this.drawScalable();
    }
  }

  resizeD3() {
    if (this._isValid()) {
      this._updateWidthHeight();

      d3.select(this.svg.node().parentNode).style('width', this.pwidth)
        .style(
          'height', this.pheight);
      this.svg.style('width', this.pwidth).style('height', this.pheight);
      // this.svg.select('g').attr('width', this.width).attr('height', this.height);
      // this.colormap.pos(this._cmOffset());
      this.xSelector.pos(this._xsOffset());
      this.ySelector.pos(this._ysOffset());
      // this.vSelector.pos(this._vsOffset());

      this.x.range([0, this.width]);
      this.y.range([this.height, 0]);

      this.updateAxisX(this.xIndex);
      this.updateAxisY(this.yIndex);
    }
  }


  resizeScalable() {
    if (this._isValid()) {
      this._updateWidthHeight();

      d3.select(this.svg.node().parentNode).style('width', this.pwidth)
        .style(
          'height', this.pheight);
      this.svg.style('width', this.pwidth).style('height', this.pheight);
      // this.svg.select('g').attr('width', this.width).attr('height', this.height);
      // this.colormap.pos(this._cmOffset());
      this.xSelector.pos(this._xsOffset());
      this.ySelector.pos(this._ysOffset());
      // this.vSelector.pos(this._vsOffset());

      this.x.range([0, this.width]);
      this.y.range([this.height, 0]);

      this.updateAxisX(this.xIndex);
      this.updateAxisY(this.yIndex);
      this.draw();
    }
  }
  resize() {
    if (this.renderMode === "d3") {
      this.resizeD3();
    } else if (this.renderMode === "Scalable") {
      this.resizeScalable();
    }
  }

  updatePos(px, py, method) {
    // console.log("scatterplots: update axis X", index);
    for (var i = 0; i < this.plotData.length; i++) {
      this.plotData[i][0] = px[i];
      this.plotData[i][1] = py[i];
    }
    this.x.domain(d3.extent(this.plotData, d => d[0]));
    this.y.domain(d3.extent(this.plotData, d => d[1]));

    this.yAxis.scale(this.y);
    this.svg.select("#y-axis").call(this.yAxis);

    this.xAxis.scale(this.x);
    this.svg.select("#x-axis")
      .attr('transform', 'translate(0,' + this.height + ")")
      .call(this.xAxis);

    this.svg.selectAll("circle")
      .attr('cx', d => this.x(d[0]))
      .attr('cy', d => this.y(d[1]));

    this.xSelector.setTempLabel(method + '_0');
    this.ySelector.setTempLabel(method + '_1');
  }

  updateAxisX(index) {
    if (this.xIndex !== index) {
      this.xIndex = index;
      // console.log("scatterplots: update axis X", index);
      for (var i = 0; i < this.plotData.length; i++) {
        this.plotData[i][0] = this.data[index][i];
      }
      this.x.domain(d3.extent(this.plotData, d => d[0]));
    }

    this.xAxis.scale(this.x);
    this.svg.select("#x-axis")
      .attr('transform', 'translate(0,' + this.height + ")")
      .call(this.xAxis);
    //this.svg.selectAll("circle").attr('cx', d => this.x(d[0]));
    this.selectpcCallback([this.xIndex, this.yIndex]);
    this.draw();
  }

  updateAxisY(index) {
    if (this.yIndex !== index) {
      this.yIndex = index;
      // console.log("scatterplots: update axis Y:", index);
      for (var i = 0; i < this.plotData.length; i++) {
        this.plotData[i][1] = this.data[index][i];
      }
      this.y.domain(d3.extent(this.plotData, d => d[1]));
    }
    this.yAxis.scale(this.y);
    this.svg.select("#y-axis").call(this.yAxis);
    //this.svg.selectAll("circle").attr('cy', d => this.y(d[1]));
    this.selectpcCallback([this.xIndex, this.yIndex]);
    this.draw();
  }

  updateValue(index) {
    // console.log("scatterplots: update value");
    for (var i = 0; i < this.plotData.length; i++) {
      this.plotData[i][2] = this.data[index][i];
    }
    this.colormap.range(d3.extent(this.plotData, d => d[2]));
    this.svg.selectAll("circle")
      .style("fill", d => this.colormap.lookup(d[2]));
  }

  updateColor(colormap) {
    this.svg.selectAll("circle")
      .style("fill", d => this.colormap.lookup(d[2]));
  }

  updateHighlight(indexList = []) {
    //console.log(this.ext);
    //console.log(this.segs);

    //console.log(this.segs[this.ext[indexList[0]]]);
    if (this._isValid()) {
      //have invalid index -1
      if (indexList.indexOf(-1) > -1)
        return;

      if (indexList.length === 0) {
        //clear highlight

        //this.svg.selectAll("circle").style("fill-opacity", 1.0);
        //this.svg.selectAll("circle").style("stroke", "grey");
        this.draw()
      } else {

        this.draw(this.segs[this.ext[indexList[0]]]);
        // Will Think about this part, when to unhighlight
        //else if (index.length === 1)
        //    this.draw();

        //console.log('Will draw highlighted pts here')
        // console.log(indexList);
        //set highlight
        /*
        this.svg.selectAll("circle").style("fill-opacity", (d, i) => {
            if (indexList.indexOf(i) > -1) {
                return 1.0;
            } else {
                return 0.03;
            }
        }).style("stroke", (d, i) => {
            if (indexList.indexOf(i) > -1) {
                return "black";
            } else {
                return "grey";
            }
        });
        */
      }
    }
  }

  test() {
    //this.densityScale = this.denseSlider.value();
    //this._rehighlight();
    this.gamma = this.denseSlider.value() / 100;
    //console.log(this.gamma);
    this.draw();

  }
  _sliderOffset() {
    return [150, -55];
  }

  _sliderSize() {
    return [200, 120];
  }

  _cmOffset() {
    return [this.width - 470, -30];
  }
  _xsOffset() {
    return [this.width - 100, this.height + 22];
  }
  _ysOffset() {
    return [0, -30];
  }
  _vsOffset() {
    return [this.width - 105, -30];
  }



  // linspace(a,b,n) {
  //   if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
  //   if(n<2) { return n===1?[a]:[]; }
  //   var i,ret = Array(n);
  //   n--;
  //   for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
  //   return ret;
  //   }
  // order decides which dim to render first
  canvas_render_pts(fctx, bctx, data, mark, width, height, left, top, order,
    offsetX, offsetY) {
    // console.log(mark);

    // update width, height, left, top here
    //fctx.clearRect(left, top, width *2 + 600, height + 300*2);
    fctx.fillStyle = 'white';
    fctx.fillRect(left-200, top-200, width + 800, height + 500);



    // console.log("off X", offsetX);// global vs local
    // console.log("off Y", offsetY);// global va local
    //var xscale = 1;
    //var yscale = 1;

    // Need to Truncate d 
    var total = mark[0].length;
    var startx=0, endx=total; 
    var starty=0, endy=total;

    if (offsetX) {
      //var globalrangeX = offsetX[0];
      // var globalrangeX = [Math.min(offsetX[0][0], offsetX[1][0]), Math.max(offsetX[0][1], offsetX[1][1])];
      
      var globalrangeX = offsetX[0];  
      var localrangeX = offsetX[1];
      // console.log("global: ", globalrangeX, " local: ", localrangeX);
      var localmin = localrangeX[0];
      var localmax = localrangeX[1];

      //if(localrangeX[0]<globalrangeX[0])
      if (localrangeX[0]<globalrangeX[0]){
        localmin = globalrangeX[0];
        startx = parseInt((globalrangeX[0]-localrangeX[0])/(localrangeX[1]-localrangeX[0])*total);
      }
      
      if(localrangeX[1]>globalrangeX[1]){
        localmax = globalrangeX[1];
        endx = parseInt(total-(localrangeX[1]-globalrangeX[1])/(localrangeX[1]-localrangeX[0])*total);
      }

      left = left + width * (localmin- globalrangeX[0]) / (globalrangeX[1] - globalrangeX[0]);
      //width = width * (localrangeX[1] - localrangeX[0]) / (globalrangeX[1] - globalrangeX[0]);
      width = width * (localmax - localmin) / (globalrangeX[1] - globalrangeX[0]);

      
    }
    if (offsetY) {
      // var globalrangeY = [Math.min(offsetY[0][0], offsetY[1][0]), Math.max( offsetY[0][1], offsetY[1][1])]; //[Math.min(), Math.max()];
      var globalrangeY = offsetY[0];
      var localrangeY = offsetY[1];
      // console.log("global: ", globalrangeY, " local: ", localrangeY);
      var localmin = localrangeY[0];
      var localmax = localrangeY[1];

      if (localrangeY[0]<globalrangeY[0]){
        localmin = globalrangeY[0];
        starty = parseInt((globalrangeY[0]-localrangeY[0])/(localrangeY[1]-localrangeY[0])*total);

      }
      if(localrangeY[1]>globalrangeY[1]){
        localmax = globalrangeY[1];
        endy = parseInt(total-(localrangeY[1]-globalrangeY[1])/(localrangeY[1]-localrangeY[0])*total);
      
      }
      top = top + height * (globalrangeY[1] - localmax) / (globalrangeY[1] - globalrangeY[0]);
      
      height = height * (localmax-localmin) / (globalrangeY[1] - globalrangeY[0]);
      //fctx.clearRect(left, top, width + 600, height + 300);

    }


    // console.log(total);
    // This will be changed for selection with indx, indy
    var d = data;

    if (data.length > 1) {

      // console.log(startx, endx, starty, endy)
      // var allpts = d.reduce((a, b) => a + b, 0);
      //Shusen: should not normalized using all point, but by the most biggest bin
      var allpts = Math.max(...data);

      // Need to change this 

      var binw = width / (endx-startx+0.0000001);//total;
      var binh = height / (endy-starty+0.0000001);//total;


      let fg_ctx = fctx; //d3.select(this).select('.canvas-bg').node().getContext('2d');
      let bg_ctx = bctx; //d3.select(this).select('.canvas-fg').node().getContext('2d');


      //bg_ctx.save();
      //fg_ctx.save();

      //bg_ctx.fillStyle = 'white';
      //bg_ctx.strokeStyle = 'black';
      //bg_ctx.clearRect(0, 0, width, height);

      //bg_ctx.fillRect(left, top, width, height);
      //bg_ctx.strokeRect(0, 0,  width, height);

      // Sometimes does not work right for some reason.
      fg_ctx.clearRect(left-200, top-200, width + 800, height + 500);

      fg_ctx.fillStyle = 'white';

      fg_ctx.fillRect(left-200, top-200, width + 800, height + 500);

      if (order === 1) {
        for (var x = startx; x < endx; x++) {
          for (var y = starty; y < endy; y++) {
            if (d[x * total + y] != 0) {
              var densty = d[x * total + y] / allpts;
              // gamma correction
              var opac = this.A * Math.pow(densty, this.gamma);
              //                            fg_ctx.fillStyle = "rgba("+parseInt(100*densty)+",10,"+parseInt(255*(1-densty))+"," + this.densityScale*50 * densty + ")";
              // fg_ctx.fillStyle = "rgba(" + parseInt(100 * densty) + ",10," +
              fg_ctx.fillStyle = "rgba(" + "10" + ",10," +
                parseInt(255) + "," + opac + ")";

              fg_ctx.fillRect(left + binw * x, top + height - binh * (y + 1),
                binw, binh);

              //fg_ctx.fillRect(parseInt(left + binw * x), parseInt(top + height - binh * (y + 1)), parseInt(binw), parseInt(binh));
            }

          }
        }
      }
      // reverse order
      else if (order === -1) {
        for (var x = 0; x < total; x++) {
          for (var y = 0; y < total; y++) {
            if (d[x * total + y] != 0) {
              var densty = d[x * total + y] / allpts;
              //fg_ctx.fillStyle = "rgba("+200+",100,"+160+"," + 500 * densty  + ")";
              var opac = this.A * Math.pow(densty, this.gamma);
              // fg_ctx.fillStyle = "rgba(" + parseInt(100 * densty) + ",10," +
              //   parseInt(255 * (1 - densty)) + "," + opac + ")";
              fg_ctx.fillStyle = "rgba(" + "10" + ",10," +
                parseInt(255) + "," + opac + ")";
              fg_ctx.fillRect(left + binw * y, top + height - binh * (x + 1),
                binw, binh);
            }
          }
        }
      } else {
        // order = 0 in this case
        for (var x = 0; x < total; x++) {
          if (d[x] != 0) {
            var densty = d[x] / allpts;
            //fg_ctx.fillStyle = "rgba("+200+",100,"+160+"," + 500 * densty  + ")";
            var opac = this.A * Math.pow(densty, this.gamma);
            // fg_ctx.fillStyle = "rgba(" + parseInt(100 * densty) + ",10," +
            //   parseInt(255 * (1 - densty)) + "," + opac + ")";
            fg_ctx.fillStyle = "rgba(" + "10" + ",10," +
              parseInt(255) + "," + opac + ")";
            fg_ctx.fillRect(left + binw * x, top + height - binh * (x + 1),
              binw, binh);
          }
        }
      }
    }
  }

  find_index(d1, d2) {
    var dimf = d1 + '$' + d2;
    var dimr = d2 + '$' + d1;
    if (dimf in this.comb)
      return [this.comb[dimf], 1];
    else if (dimr in this.comb)
      return [this.comb[dimr], -1];
    else if (d1 in this.comb)
      return [this.comb[d1], 0];
  }
}
