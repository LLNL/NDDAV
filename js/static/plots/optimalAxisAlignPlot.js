//svg with embedded canvas and UI
class optimalAxisAlignPlot extends basePlot {
    constructor(div) {
        super(div);
        // this.colorList = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8",
        //     "#253494"
        // ];
        this.colorList = ["red", "green"];
        // this.colorList = ["red", "orange", "green"];
        // this.colorList = d3.scale.category10().range();
        // console.log(this.colorList);
        this.histFlag = true;
        // this.histFlag = false;
        this.evidenceThreshold = 0.1;
    }

    bindNodeCallback(callback) {
        this.nodeCallback = callback;
    }

    evidenceFilter(decomposition, threshold) {
        console.log(decomposition);
        //AP index to be removed
        var decomposition = JSON.parse(JSON.stringify(decomposition));
        var decomp = {
            "X": decomposition.X
        };
        decomp.axisAligned = [];
        decomp.APhist = []
        var APIndexRemove = [];
        var APIndexMap = []
        var APcount = 0;
        for (var i = 0; i < decomposition.axisAligned.length; i++) {
            APIndexMap.push(APcount);
            if (decomposition.axisAligned[i][2] < threshold) {
                APIndexRemove.push(i);
            } else {
                APcount = APcount + 1;
                decomp.axisAligned.push(decomposition.axisAligned[i]);
                decomp.APhist.push(decomposition.APhist[i]);
            }
        }

        var APremoveSet = new Set(APIndexRemove);
        decomp.map = []
        for (var i = 0; i < decomposition.map.length; i++) {
            if (!APremoveSet.has(decomposition.map[i][1])) {
                decomp.map.push(decomposition.map[i]);
            }
        }

        var LPset = new Set();
        for (var i = 0; i < decomp.map.length; i++) {
            LPset.add(decomp.map[i][0]);
        }


        //LP index to be removed
        decomp.linear = [];
        decomp.LPhist = [];
        var LPIndexMap = []
        var LPcount = 0;
        for (var i = 0; i < decomposition.linear.length; i++) {

            LPIndexMap.push(LPcount);
            if (LPset.has(i)) {
                decomp.linear.push(decomposition.linear[i]);
                decomp.LPhist.push(decomposition.LPhist[i]);
                LPcount = LPcount + 1;
            }
        }

        //update the map
        for (var i = 0; i < decomp.map.length; i++) {
            decomp.map[i][0] = LPIndexMap[decomp.map[i][0]];
            decomp.map[i][1] = APIndexMap[decomp.map[i][1]];
        }

        console.log(decomp);

        return decomp;
    }

    setDecomposition(decomposition) {
        this.decomposition = decomposition;
        this.data = this.evidenceFilter(decomposition, this.evidenceThreshold);

        this.draw();
    }

    setPlotData(plotData, names) {
        this.plotData = plotData;
        this.names = names;
        // this.draw();
    }

    draw() {
        var topOffset = 0;
        // var topOffset = 25;
        var leftOffset = 0;

        var leftMargin = 30;
        var rightMargin = 30;
        var spacingH = 40;
        var spacingW = 30;

        if (this._isValid() && this.plotData !== undefined) {
            this._updateWidthHeight();
            this.width = this.pwidth;
            this.height = this.pheight;

            if (d3.select(this._div).select('svg').empty()) {
                this.svg = d3.select(this._div).append("svg")
                    .attr("id", "axisAligned")
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .style("position", "absolute");
            } else {
                this.svg.attr('width', this.width)
                    .attr('height', this.height)
                    .style("position", "absolute");
            }

            var numOfLinear = this.data.linear.length;
            var numOfAxisAligned = this.data.axisAligned.length;
            var numOfLinks = this.data.map.length;

            //X is the input data
            var X = new Matrix(this.data.X);
            // console.log(X);

            //init the layout
            ///////////////////////// drawing nodes //////////////////////////
            var height = this.height;
            var width = this.width;

            //init nodes
            if (this._listOfLinearPlot === undefined ||
                this._listOfLinearPlot.length !== numOfLinear) {

                this._listOfLinearPlot = [];
                this._listOfAxisAlignedPlot = [];
                this._listOfHighlightRect = [];
                //create linear nodes

                var projCount = Math.max(numOfLinear, numOfAxisAligned);
                var gsizeH = height / projCount - spacingH;
                var gsizeW = width / projCount - spacingW;
                var gsize = Math.min(gsizeH, gsizeW, width / 5.0);
                rightMargin = gsize / 2.0;
                leftMargin = gsize / 2.0;
                var size = [gsize, gsize];

                for (var i = 0; i < numOfLinear; i++) {
                    var pos = [width / 2.0 * 0.5 + leftMargin,
                        height / numOfLinear * (i + 0.5) + topOffset
                    ];

                    var node = new d3UIplotGlyph(this.svg, pos, size, -1,
                        this.histFlag);

                    var projMat = new Matrix(this.data.linear[i]);
                    var projData = Matrix.multiply(projMat, X);
                    node.setData(projData.T.toArray(), this.plotData[this.plotData
                            .length - 1],
                        this.colorList, this.data.LPhist[i]);

                    var rect = this.svg.append('rect')
                        .datum(i)
                        .attr("id", "rect" + i)
                        .attr("x", pos[0] - 0.5 * gsize)
                        .attr("y", pos[1] - 0.5 * gsize)
                        .attr("width", gsize)
                        .attr("height", gsize)
                        .attr("fill", "white")
                        .attr("stroke", "grey")
                        .on('click', d => {
                            this.updateSelectionHighlight(d);
                        });
                    this._listOfHighlightRect.push(rect);
                    this._listOfLinearPlot.push(node);
                }

                for (var i = 0; i < numOfAxisAligned; i++) {
                    // var group = this.svg.append("g");
                    var pos = [width /
                        2.0 * 1.5 - rightMargin,
                        height / numOfAxisAligned * (i + 0.5) +
                        topOffset
                    ];
                    var node = new d3UIplotGlyph(this.svg, pos, size, 1,
                        this.histFlag);

                    var index1 = this.data.axisAligned[i][0];
                    var index2 = this.data.axisAligned[i][1];

                    var zipdata = this.plotData[index1].map((e, i) => {
                        return [e, this.plotData[index2][i]];
                    });
                    // console.log(zipdata, index1, index2);
                    node.setData(zipdata, this.plotData[this.plotData.length -
                            1], this.colorList,
                        this.data.APhist[i], [this.names[index1],
                            this.names[index2]
                        ], this.data.axisAligned[i][2]);

                    var rect = this.svg.append('rect')
                        .datum(i + numOfLinear)
                        .attr("id", "rect" + (i + numOfLinear))
                        .attr("x", pos[0] - 0.5 * gsize)
                        .attr("y", pos[1] - 0.5 * gsize)
                        .attr("width", gsize)
                        .attr("height", gsize)
                        .style("fill", "white")
                        .attr("stroke", "grey")
                        .on('click', d => {
                            this.updateSelectionHighlight(d);
                        });

                    this._listOfHighlightRect.push(rect);
                    this._listOfAxisAlignedPlot.push(node);
                }
            } else {
                /////////// update plots ///////////////
                var height = this.height;
                var width = this.width;

                var projCount = Math.max(numOfLinear, numOfAxisAligned);
                var gsizeH = height / projCount - spacingH;
                var gsizeW = width / projCount - spacingW;

                var gsize = Math.min(gsizeH, gsizeW, width / 5.0);
                rightMargin = gsize / 2.0;
                leftMargin = gsize / 2.0;
                var size = [gsize, gsize];

                for (var i = 0; i < numOfLinear; i++) {
                    var pos = [width / 2.0 * 0.5 + leftMargin,
                        height / numOfLinear * (i + 0.5) +
                        topOffset
                    ];
                    this._listOfLinearPlot[i].update(pos, size);
                    this._listOfHighlightRect[i]
                        .attr("x", pos[0] - 0.5 * gsize)
                        .attr("y", pos[1] - 0.5 * gsize)
                        .attr("width", gsize)
                        .attr("height", gsize)
                }

                for (var i = 0; i < numOfAxisAligned; i++) {
                    var pos = [width / 2.0 * 1.5 - rightMargin,
                        height / numOfAxisAligned * (i + 0.5) +
                        topOffset
                    ];
                    this._listOfAxisAlignedPlot[i].update(pos, size);
                    this._listOfHighlightRect[i + numOfLinear]
                        .attr("x", pos[0] - 0.5 * gsize)
                        .attr("y", pos[1] - 0.5 * gsize)
                        .attr("width", gsize)
                        .attr("height", gsize)

                }
            }

            //////////////////////// draw linking /////////////////////////

            //creat links
            if (this.edge_data === undefined) {
                this.edge_data = [];
                for (var i = 0; i < numOfLinks; i++) {
                    this.edge_data.push({
                        'source': this.data.map[i][0],
                        'target': this.data.map[i][1] +
                            numOfLinear,
                        'weight': this.data.map[i][2]
                    });
                }
                this.updateNodeData(); //for edge
                // console.log(node_data, edge_data);
                var fbundling = d3.ForceEdgeBundling()
                    .nodes(this.node_data)
                    .edges(this.edge_data);
                var results = fbundling();
                var d3line = d3.svg.line()
                    .x(function(d) {
                        return d.x;
                    })
                    .y(function(d) {
                        return d.y;
                    })
                    .interpolate("linear");

                for (var i = 0; i < results.length; i++) {
                    var edge_subpoint_data = results[i];

                    // for each of the arrays in the results
                    // draw a line between the subdivions points for that edge
                    // console.log(edge_subpoint_data);
                    this.svg.append("path")
                        .attr("d", d3line(edge_subpoint_data))
                        .attr("id", "path" + i)
                        .style("stroke-width", this.edge_data[i].weight *
                            5.0)
                        .style("stroke", "grey")
                        .style("fill", "none")
                        .style('stroke-opacity', 0.5); //use opacity as blending
                }
            } else {
                this.updateNodeData(); //for edge

                var fbundling = d3.ForceEdgeBundling()
                    .nodes(this.node_data)
                    .edges(this.edge_data);
                var results = fbundling();
                var d3line = d3.svg.line()
                    .x(function(d) {
                        return d.x;
                    })
                    .y(function(d) {
                        return d.y;
                    })
                    .interpolate("linear");

                for (var i = 0; i < results.length; i++) {
                    var edge_subpoint_data = results[i];

                    // for each of the arrays in the results
                    // draw a line between the subdivions points for that edge
                    // console.log(edge_subpoint_data);
                    this.svg.select("#path" + i)
                        .attr("d", d3line(edge_subpoint_data))
                        .style("stroke-width", this.edge_data[i].weight *
                            5.0);

                }
            }
        }
    }

    updateNodeData() {
        this.node_data = {};

        for (var i = 0; i < this._listOfLinearPlot.length; i++) {
            var pos = this._listOfLinearPlot[i].getOutputPortCoord()
            this.node_data[i] = {
                'x': pos[0],
                'y': pos[1]
            };
        }

        var numOfLinear = this._listOfLinearPlot.length;
        for (var i = 0; i < this._listOfAxisAlignedPlot.length; i++) {
            var pos = this._listOfAxisAlignedPlot[i].getInputPortCoord()
            this.node_data[i + numOfLinear] = {
                'x': pos[0],
                'y': pos[1]
            };
        }
    }

    updateSelectionHighlight(d) {
        var highlightNodes = [];
        var highlightEdges = [];
        highlightNodes.push(d);
        for (var i = 0; i < this.edge_data.length; i++) {
            if (d === this.edge_data[i].source) {
                highlightNodes.push(this.edge_data[i].target);
                highlightEdges.push(i);
            }
            if (d === this.edge_data[i].target) {
                highlightNodes.push(this.edge_data[i].source);
                highlightEdges.push(i);
            }
        }

        // console.log('nodeIndex:', d);
        if (d >= this._listOfLinearPlot.length) {
            this.nodeCallback('AP', Number(d) - this._listOfLinearPlot.length);
        } else {
            this.nodeCallback('LP', Number(d));
        }
        // console.log(highlightNodes, highlightEdges);
        // console.log(this.edge_data);

        //clear previous
        for (var i = 0; i < Object.keys(this.node_data).length; i++) {
            this.svg.select("#rect" + i).style("stroke", "grey")
                .style("fill", "white");
        }

        for (var i = 0; i < this.edge_data.length; i++)
            this.svg.select("#path" + i).style("stroke", "grey");

        //update based on current selection
        this.svg.select("#rect" + d).style("fill", "pink");

        for (var i = 0; i < highlightNodes.length; i++) {
            this.svg.select("#rect" + highlightNodes[i])
                .style("stroke-width", 2.0)
                .style("stroke", "red");
        }

        for (var i = 0; i < highlightEdges.length; i++) {
            this.svg.select("#path" + highlightEdges[i]).style("stroke",
                "red");
        }

    }

    resize() {
        this.draw();
    }
}
