class persistencePlot {
  //input the div for the display position
  constructor(svg, pos = [30, 15], size = [150, 70], id = "persistencePlot") {
    this.svgContainer = svg;
    this._pos = pos;
    this._size = size;
    this._id = id;
    this._maxExtremaCount = 5000;
    this.isShowVariation = false;
  }

  setComputeSpineCallback(computeTopoSpine) {
    this.computeTopoSpine = computeTopoSpine;
  }

  setData(persistence, variation = undefined) {

    //set default persistence
    var currentPersistence = 0.5 * (persistence[1] + persistence[2]);
    // var currentPersistence = 0.2;
    var currentVariation = 0.0;
    console.log("currentPersistence", currentPersistence);

    //store the full persistence range
    this.fullPersistence = persistence;
    this.fullVariation = variation;

    this.currentPerRange = [0.0, 1.0];
    this.currentVarRange = [1.0, 0.0];

    //clap per / var range by extrema number threshold
    if (this.fullPersistence.length > this._maxExtremaCount) {
      // console.log(this.fullPersistence);
      // console.log(this.fullVariation);
      // console.log("cliped extrema range\n");
      persistence = this.fullPersistence.slice(0, this._maxExtremaCount);
      this.currentPerRange = [0.0, Math.max(persistence)];
      variation = this.fullVariation.slice(0, this._maxExtremaCount);
      this.currentPerRange = [Math.min(variation), 0.0];
    }

    this.currentPersistence = currentPersistence;
    this.currentVariation = currentVariation;

    this.persistenceList = persistence;
    this.variationList = variation;
    // console.log("Persistecne:", this.currentPersistence)
    // console.log(persistence);

    //convert data to draw staircase line plot
    function convertPlotData(plotData) {
      var data = [];
      for (var i = 0; i < plotData.length; i++) {
        data.push(plotData[i].slice());
        if (i + 1 < plotData.length)
          data.push([plotData[i + 1][0], plotData[i][1]]);
      }
      return data;
    }

    if (persistence !== undefined) {
      if (persistence.length > 0) {
        persistence[0] = 1.0;
      }

      var persistenceY = Array.apply(null, Array(persistence.length))
        .map(function(_, i) {
          return Number(i + 1.0);
        });

      //extend persistence to 1.0 to 0.0
      persistence.push(0.0);
      persistenceY.push(persistenceY[persistenceY.length - 1]);
      this.persistence = convertPlotData(zip([persistence,
        persistenceY
      ]));
      // console.log('persistence:', this.persistence);
    }

    // this.persistence = persistence;
    if (variation !== undefined) {
      // this.variation = variation;
      var variationY = Array.apply(null, Array(variation.length))
        .map(function(_, i) {
          return Number(i + 1.0);
        });

      function sortNumber(a, b) {
        return a - b;
      }
      variationY.sort(sortNumber);
      variation.sort(sortNumber);
      // console.log(variationY, variation);

      // extend variation to 0.0 to 1.0
      variation.push(1.0);
      variationY.push(variationY[variationY.length - 1]);
      variation.splice(0, 0, 0.0);
      variationY.splice(0, 0, 0);
      this.variation = convertPlotData(zip([variation, variationY]));
    }
    this.draw();
  }

  pos(pos) {
    this._pos = pos;
    this.draw();
  }

  //////////////////// drawing persistence plot /////////////////
  draw() {
    if (this.persistence === undefined || this.variation === undefined)
      return;

    if (this.svgContainer && this.persistence.length > 0 && this.variation
      .length > 0) {
      var fullData = this.persistence.concat([
        [this.persistence[0][0], 0]
      ]);
      // var fullData = this.persistence;
      // var fullData = this.persistence.concat(this.variation);
      this.x = d3.scale.linear().domain(d3.extent(fullData, function(
        d) {
        return d[0];
      })).range([0, this._size[0]]);
      // console.log('x domain:\n\n', this.x.domain());
      this.y = d3.scale.linear().domain(d3.extent(fullData, function(
        d) {
        return d[1];
      })).range([this._size[1], 0]);
      var xAxis = d3.svg.axis().scale(this.x).orient('bottom').ticks(
        4);
      var yAxis = d3.svg.axis().scale(this.y).orient('left').ticks(3);
      // var yAxisRight = d3.svg.axis().scale(this.y).orient('left').ticks(3);
      var line = d3.svg.line().x(function(d) {
        return this.x(d[0]);
      }.bind(this)).y(function(d) {
        return this.y(d[1]);
      }.bind(this)).interpolate("linear");
      //clear up
      this.svgContainer.select("#" + this._id).remove();
      this.svg = this.svgContainer.append('g')
        .attr("id", this._id)
        .attr('transform', 'translate(' + this._pos[0] + "," +
          this._pos[1] +
          ")");

      //add plot
      this.svg.append('g').attr('class', 'axis').attr('transform',
        'translate(0,' +
        this._size[1] + ")").call(xAxis);
      this.svg.append('g').attr('class', 'axis').call(yAxis);
      this.svg.append('path').attr('d', line(this.persistence)).attr(
        'fill',
        'none').attr(
        "stroke", "blue").attr("stroke-width", 2).attr(
        "opacity", 0.5);
      if (this.isShowVariation) {
        this.svg.append('path').attr('d', line(this.variation)).attr(
          'fill',
          'none').attr(
          "stroke", "red").attr("stroke-width", 2).attr("opacity",
          0.5);
      }

      //draw arrow control
      //persistence
      this.svg.append("path")
        .attr("transform", function(d) {
          return "translate(" + 155 + "," + 40 + ")";
        })
        .attr("d", d3.svg.symbol().type('triangle-up').size(110))
        .style('fill', 'blue')
        .on('click', d => {
          this.updatePersistenceStep(1);
        });
      this.svg.append("path")
        .attr("transform", function(d) {
          return "translate(" + 155 + "," + 58 + ")";
        })
        .attr("d", d3.svg.symbol().type('triangle-down').size(110))
        .style('fill', 'blue')
        .on('click', d => {
          this.updatePersistenceStep(-1);
        });
      //variation
      if (this.isShowVariation) {
        this.svg.append("path")
          .attr("transform", function(d) {
            return "translate(" + 175 + "," + 40 + ")";
          })
          .attr("d", d3.svg.symbol().type('triangle-up').size(110))
          .style('fill', 'red')
          .on('click', d => {
            this.updateVariationStep(1);
          });
        this.svg.append("path")
          .attr("transform", function(d) {
            return "translate(" + 175 + "," + 58 + ")";
          })
          .attr("d", d3.svg.symbol().type('triangle-down').size(120))
          .style('fill', 'red')
          .on('click', d => {
            this.updateVariationStep(-1);
          });
      }
    }
    this.updateMarker();
  }

  updatePersistenceStep(offset) {
    var peakCount = Number(this.currentPeakCount) + Number(offset);
    if (peakCount < 1)
      peakCount = 1;

    while (this.currentPersistence === this.persistenceList[peakCount -
        1]) {
      peakCount = peakCount + Math.sign(offset) * 1;
    }

    this.currentPersistence = (this.persistenceList[peakCount - 1] +
      this.persistenceList[peakCount]) / 2.0;
    // console.log("peakCount", peakCount, 'currentPersistence:', this.currentPersistence);

    // console.log('persistenceList:', this.persistenceList);
    this.computeTopoSpine(this.currentPersistence, this.currentVariation);
    this.updateMarker();
  }

  updateVariationStep(offset) {
    var linkCount = Number(this.currentLinkCount) + Number(offset);
    if (linkCount < 0)
      linkCount = 0;

    while (this.currentVariation === this.variationList[linkCount]) {
      linkCount = linkCount + Math.sign(offset) * 1;
    }
    this.currentVariation = this.variationList[linkCount];
    this.computeTopoSpine(this.currentPersistence, this.currentVariation);
    this.updateMarker();
  }

  /////// draw marker ////////
  updateMarker() {
    //update the marker
    var per_y = this.getPersistenceMarkerY(this.currentPersistence);
    var var_y = this.getVariationMarkerY(this.currentVariation);
    console.log(this.currentPersistence, per_y);

    var drag = d3.behavior.drag()
      .on("drag", dragged)
      .on("dragend", draggedEnd);

    this.svg.selectAll('circle').remove();
    if (this.isShowVariation) {
      this.svg.selectAll('circle')
        .data([
          [this.currentPersistence, per_y, 'p'],
          [this.currentVariation, var_y, 'v']
        ])
        .enter()
        .append('circle').attr('r', 7)
        .attr('cx', d => {
          return this.x(d[0]); // + this._pos[0];
        })
        .attr('cy', d => {
          return this.y(d[1]); // + this._pos[1];
        })
        .attr('fill', function(d, i) {
          return i ? "red" : "blue";
        })
        .attr('class', 'marker')
        // .on("mouseover", function() {
        //   d3.select(this).attr('r', 8);
        // })
        // .on("mouseout", function() {
        //   d3.select(this).attr('r', 5);
        // })
        .call(drag);
    } else {
      this.svg.selectAll('circle')
        .data([
          [this.currentPersistence, per_y, 'p']
        ])
        .enter()
        .append('circle').attr('r', 7)
        .attr('cx', d => {
          return this.x(d[0]); // + this._pos[0];
        })
        .attr('cy', d => {
          return this.y(d[1]); // + this._pos[1];
        })
        .attr('fill', function(d, i) {
          return i ? "red" : "blue";
        })
        .attr('class', 'marker')
        // .on("mouseover", function() {
        //   d3.select(this).attr('r', 8);
        // })
        // .on("mouseout", function() {
        //   d3.select(this).attr('r', 5);
        // })
        .call(drag);
    }

    var that = this;

    function dragged(d) {
      var currentX = that.x.invert(d3.event.x);
      var currentY = 0.0;
      if (d[2] === 'p') {
        currentY = that.getPersistenceMarkerY(currentX);
        that.currentPersistence = currentX;
      } else if (d[2] === 'v') {
        currentY = that.getVariationMarkerY(currentX);
        that.currentVariation = currentX;
      }
      // console.log(currentX, currentY);
      d3.select(this).attr("cx", that.x(currentX)); // + this._pos[0]);
      d3.select(this).attr("cy", that.y(currentY)); // + this._pos[1]);
    }

    function draggedEnd(d) {
      //callback to update topoSpine
      // console.log("#### update spine ####");
      that.computeTopoSpine(that.currentPersistence, that.currentVariation);
    }
  }

  ////// accessor /////
  getCurrentVariation() {
    return this.currentVariation;
  }

  getCurrentPersistence() {
    return this.currentPersistence;
  }

  ////// helper function /////
  getPersistenceMarkerY(persistenceX) {
    var per_y;
    for (var i = 0; i < this.persistence.length; i++) {
      if (this.persistence[i][0] >= persistenceX) {
        per_y = this.persistence[i][1];
        this.currentPeakCount = this.persistence[i][1];
      }
    }
    return per_y;
  }
  getVariationMarkerY(variationX) {
    var var_y;
    for (var i = this.variation.length - 1; i >= 0; i--) {
      if (this.variation[i][0] >= variationX) {
        var_y = this.variation[i][1];
        this.currentLinkCount = this.variation[i][1];
      }
    }
    return var_y;
  }
}
