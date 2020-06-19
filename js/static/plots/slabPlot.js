class slabPlot extends basePlot {
    constructor(div) {
        super(div);
        //defaul slab size
        this.dimIndex = 0;
        this.margin = {
            top: 50,
            right: 20,
            bottom: 55,
            left: 45
        };
    }

    setData(data, names) {
        // console.log(data);
        this.data = data;
        this.names = names;
        this.funcIndex = data.length - 1;
        // this.draw();
    }

    setSubselection(list) {
        this.subselectionSet = new Set(list);
    }

    getFocusedDim() {
        return this.dimIndex;
    }

    getPoint(index) {
        if (this.data !== undefined) {
            var point = []
            for (var i = 0; i < this.data.length; i++) {
                point.push(this.data[i][index]);
            }
            console.log(index, point);

            //record the current focus point
            this.focusIndex = index;
            this.focusPoint = point;
            return point;
        }
    }

    setDistanceList(focusPointInfo) {
        this.drawType = focusPointInfo.type;

        if (focusPointInfo.type === "continuous") {
            this.fLines = focusPointInfo.fLines;
            this.domainLine = focusPointInfo.domainLine;
            this.rangeNames = focusPointInfo.rangeNames;
            this.domainNames = focusPointInfo.domainNames;
            this.distList = focusPointInfo.dist;
            //for rendering purpose, draw the un-perturbed point last
            this.fLines.reverse();
            this.distList.reverse();

            this.focusIndex = focusPointInfo.focusIndex;
            this.focusPoint = focusPointInfo.focusPoint;

            this.drawContinuous();

        } else if (focusPointInfo.type === "segmentShape") {
            this.distList = focusPointInfo.dist;
            this.rangeNames = focusPointInfo.rangeNames;
            this.domainNames = focusPointInfo.domainNames;
            this.focusIndex = focusPointInfo.focusIndex;
            this.focusPoint = focusPointInfo.focusPoint;
            this.segments = focusPointInfo.segments; //indice of the segment
            this.drawSegmentShape();

        } else {
            this.distList = focusPointInfo.dist;
            this.rangeNames = focusPointInfo.rangeNames;
            this.domainNames = focusPointInfo.domainNames;
            this.focusIndex = focusPointInfo.focusIndex;
            // console.log(this.distList);

            //set the function index to be the first range
            this.refFuncIndex = this.domainNames.length;
            this.cmpFuncIndex = this.domainNames.length;

            this.draw();
        }
    }

    getSlabSize() {
        //if the UI is available update slabSize
        var slabSize = 0.1;
        if (this.slabSizeSlider) {
            slabSize = this.slabSizeSlider.value();
        }
        return slabSize;
    }

    updateSlabSize() {
        if (this.drawType === "continuous") {
            this.focusPointCallback(this.focusIndex, this.dimIndex, this.getSlabSize());
        } else
            this.draw();
    }

    resize() {
        if (this.drawType === "continuous") {
            this.drawContinuous();
        } else if (this.drawType === "segmentShape") {
            this.drawSegmentShape();
        } else {
            this.draw();
        }
    }

    updateUI() {
        if (this.svg) {
            this.refFuncSelector =
                new d3UIitemSelector(this.svg, this.rangeNames, this.refFuncIndex,
                    this._refFuncOffset());
            this.refFuncSelector.callback(this.updateFocusRange.bind(
                this));
            // this.cmpFuncSelector =
            //     new d3UIitemSelector(this.svg, this.rangeNames, this.cmpFuncIndex,
            //         this._cmpFuncsOffset());
            this.dimSelector =
                new d3UIitemSelector(this.svg, this.domainNames, this.dimIndex,
                    this._dimOffset());
            this.dimSelector.callback(this.updateFocusRange.bind(this));
            this.slabSizeSlider =
                new d3UIslider(this.svg, "SlabSize", [0, 100], this._slabSizeOffset());
            this.slabSizeSlider.callback(this.draw.bind(this));
        }
    }

    //////////////////////// drawing points ///////////////////////
    draw() {
        if (this._isValid()) {
            this._updateWidthHeight();

            //init UI
            this.setupUI();

            //update plot
            this.highlightIndex = -1;
            if (this.distList !== undefined) {
                //cleanup
                this.svg.selectAll("g").remove();
                this.svg.selectAll("circle").remove();

                this.plotData = [];
                this.fullData = [];
                var count = 0;
                for (var i = 0; i < this.distList.length; i++) {
                    var size = this.getSlabSize();
                    if (this.distList[i] < size) {
                        if (i === this.focusIndex)
                            this.highlightIndex = count;

                        this.plotData.push([this.data[this.dimIndex][i],
                            this.data[this.refFuncIndex][i],
                            this.distList[i],
                            i
                        ]);
                        count++;
                    }
                    this.fullData.push([this.data[this.dimIndex][i],
                        this.data[this.refFuncIndex][i]
                    ]);
                }

                // console.log('PlotData:', this.plotData);
                var x = d3.extent(this.fullData, d => d[0]);
                var y = d3.extent(this.fullData, d => d[1]);

                this.createAxis(x, y);

                //add points
                this.svg.selectAll(".slabPoints")
                    .data(this.plotData)
                    .enter()
                    .append('circle')
                    .attr("r", (d, i) => {
                        if (this.highlightIndex === i)
                            return 10.0;
                        else
                            return 4.0 * (1.0 - d[2]) * (1.0 - d[2]);
                    })
                    .attr('cx', d => this.x(d[0]))
                    .attr('cy', d => this.y(d[1]))
                    .attr('class', "scatterplotPoints")
                    .style("fill", (d, i) => {
                        if (this.highlightIndex === i)
                            return "blue";
                        else {
                            if (this.subselectionSet.has(d[3]))
                                return "blue";
                            else
                                return "grey";
                        }
                    })
                    .style('stroke', 'black')
                    .style('stroke-width', (d, i) => {
                        if (this.highlightIndex === i)
                            return 3.0;
                        else {
                            return 0.1;
                        }
                    })
                    .on("click", (d, i) => {
                        d3.event.stopPropagation();
                        // this.updateFocusIndex(i);
                        this.updateHighlight(d[3]);
                        // this.selectionCallback(i);
                    });
            }
        }
    }

    //////////////////////// drawing lines ///////////////////////
    drawContinuous() {
        if (this.domainLine) {
            this._updateWidthHeight();

            this.setupUI();

            var x = d3.extent(this.domainLine);
            var y = d3.extent([].concat.apply([], this.fLines));
            // console.log(this.fLines[0], this.domainLine);
            this.createAxis(x, y);
            this.plotLines();
        }
    }

    ////////////////////// draw segment shape ///////////////////
    drawSegmentShape() {
        console.log("drawSegmentShape");
        if (this.segments) {
            this._updateWidthHeight();
            this.setupUI();

            this.plotData = [];
            this.plotData = this.segments.map((d, i) => {
                return [this.distList[i], this.data[this.funcIndex]
                    [d]
                ];
            })
            var x = d3.extent(this.distList);
            var y = d3.extent(this.plotData.map(d => d[1]));
            console.log(x, y);

            this.createAxis(x, y);

            //add points
            this.svg.selectAll(".slabPoints").remove();
            this.svg.selectAll(".slabPoints")
                .data(this.plotData)
                .enter()
                .append('circle')
                .attr("r", (d, i) => {
                    return 4.0;
                })
                .attr('cx', d => this.x(d[0]))
                .attr('cy', d => this.y(d[1]))
                .attr('class', "slabPoints")
                .style("fill", (d, i) => {
                    if (this.highlightIndex === i)
                        return "blue";
                    else {
                        return "grey";
                    }
                })
                .style('stroke', 'black')
                .style('stroke-width', (d, i) => {
                    if (this.highlightIndex === i)
                        return 3.0;
                    else {
                        return 0.1;
                    }
                });
            // .on("click", (d, i) => {
            //     d3.event.stopPropagation();
            //     // this.updateFocusIndex(i);
            //     // this.updateHighlight(d[3]);
            //     // this.selectionCallback(i);
            // });
        }
    }

    plotLines() {
        var line = d3.svg.line()
            .x(d => {
                return this.x(d[0]);
            })
            .y(d => {
                return this.y(d[1]);
            }); //.interpolate("monotone");

        // var plotData = this.domainLine.map((e, i) => {
        //     return [e, this.fLines[0][i]];
        // });
        // console.log(this.fLines);
        this.svg.selectAll(".lines").remove();
        var lineGraph = this.svg.selectAll(".lines")
            .data(this.fLines)
            .enter()
            .append("path")
            .attr("d", d => {
                // console.log(d);
                var plotData = d.map((e, i) => {
                    return [this.domainLine[i], e];
                });
                return line(plotData);
            })
            .attr("class", "lines")
            .attr("stroke", (d, i) => {
                if (i === this.fLines.length - 1)
                    return "red";
                else
                    return "grey";
            })
            .attr("stroke-width", (d, i) => {
                var dist = this.distList[i];
                return 3.0 * (1.0 - dist) * (1.0 - dist) + 0.5;
                // return 2.0;
            })
            .attr("opacity", (d, i) => {
                var dist = this.distList[i];
                return 0.9 * (1.0 - dist) * (1.0 - dist) + 0.1;
            })
            .attr("fill", "none");

        // console.log(this.focusPoint);
        this.svg.selectAll(".points").remove();
        this.svg
            .append("circle")
            .attr("class", "points")
            .attr("cx", d => this.x(this.focusPoint[this.dimIndex]))
            .attr("cy", d => this.y(this.focusPoint[this.focusPoint.length -
                1]))
            .attr("r", 10.0)
            .attr("fill", "blue");

        // this.svg.selectAll("path")
        //     .data([plotData])
        //     .enter().append("path")
        //     .attr("d", line)
        //     .attr("stroke", "blue");
    }

    ////////////////////// other UI elements ////////////////////

    setupUI() {
        if (this.svg === undefined) {
            //cleanup
            d3.select(this._div).select("svg").remove();

            this.svgContainer = d3.select(this._div).append("svg")
                .attr('width', this.pwidth)
                .attr('height', this.pheight);

            this.svg = this.svgContainer
                .append('g')
                .attr('transform', 'translate(' + this.margin.left +
                    "," + this.margin.top + ")");

            this.refFuncSelector =
                new d3UIitemSelector(this.svg, this.rangeNames, this.refFuncIndex,
                    this._refFuncOffset());
            this.refFuncSelector.callback(this.updateFocusRange.bind(this));
            // this.cmpFuncSelector =
            //     new d3UIitemSelector(this.svg, this.rangeNames, this.cmpFuncIndex,
            //         this._cmpFuncsOffset());
            this.dimSelector =
                new d3UIitemSelector(this.svg, this.domainNames, this.dimIndex,
                    this._dimOffset());
            this.dimSelector.callback(this.updateFocusRange.bind(this));
            this.slabSizeSlider =
                new d3UIslider(this.svg, "SlabSize", [0.0, 1.0], this._slabSizeOffset());
            this.slabSizeSlider.callback(this.updateSlabSize.bind(this));
        } else {
            this.svgContainer
                .attr('width', this.pwidth)
                .attr('height', this.pheight);
            this.dimSelector.pos(this._dimOffset());
            this.slabSizeSlider.pos(this._slabSizeOffset());
            this.refFuncSelector.pos(this._refFuncOffset());
        }
    }

    createAxis(x, y) {
        if (x !== undefined && y !== undefined) {
            this.x = d3.scale.linear().domain(x).range(
                [0, this.width]);
            this.y = d3.scale.linear().domain(y).range(
                [this.height, 0]);

            this.xAxis = d3.svg.axis().scale(this.x).orient(
                'bottom').tickFormat(
                d3.format(".3s"));
            this.yAxis = d3.svg.axis().scale(this.y).orient('left')
                .tickFormat(d3.format(".3s"));

            //add axes if not already added to svg
            if (this.svg.select(".axis").empty()) {
                this.svg.append('g').attr('class', 'axis')
                    .attr("id", "x-axis")
                    .attr('transform', 'translate(0,' + this.height +
                        ")").call(this.xAxis);

                this.svg.append('g').attr('class', 'axis')
                    .attr("id", "y-axis")
                    .attr('class', 'axis').call(this.yAxis);
            } else {
                this.xAxis.scale(this.x);
                this.yAxis.scale(this.y);
                this.svg.select("#x-axis")
                    .attr('transform', 'translate(0,' + this.height +
                        ")").call(this.xAxis);
                this.svg.select("#y-axis").call(this.yAxis);
            }
        }
    }

    bindHighlightUpdate(func) {
        this.updateHighlight = func;
    }

    bindFocusPointUpdate(func) {
        this.focusPointCallback = func;
    }

    bindFocusIndexUpdate(func) {
        this.focusIndexCallback = func;
    }

    updateFocusRange(index) {
        this.dimIndex = index;
        if (this.drawType === "continuous")
            this.focusPointCallback(this.focusIndex, this.dimIndex, this.getSlabSize());
        else
            this.focusIndexCallback(this.focusIndex, this.dimIndex);
    }

    updateFocusIndex(pointIndex) {
        // this.refFuncIndex = this.domainNames.length + index;
        this.focusIndex = pointIndex;
        this.focusIndexCallback(this.focusIndex, this.dimIndex);
        // this.draw();
    }

    /////////////// helper function //////////////
    _cmpFuncsOffset() {
        return [this.width - 105, -30];
    }

    _refFuncOffset() {
        return [0, -30];
    }

    _dimOffset() {
        return [this.width - 100, this.height + 22];
    }

    _slabSizeOffset() {
        return [this.width - 285, -30];
    }
}
