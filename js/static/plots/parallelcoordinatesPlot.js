class parallelcoordinatesPlot extends basePlot {
    constructor(div) {
        // this._div = '#' + div;
        // this._divTag = div;
        super(div);

        this.margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 20
        };
        // this.width = 600;
        // this.height = 600;
        this.currentSubselect = 0;
    }

    setData(data, names) {
        this.data = data;
        this.names = names;
        this._generatePlotData(data, names);
        this.draw();
    }

    draw() {
        if (this._isValid()) {
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
                this.vSelector =
                    new d3UIitemSelector(this.svg, this.names, this.currentAxis, [
                        200,
                        20
                    ])
                this.colorMap =
                    new d3UIcolorMap(this.svg, "parallelCoodColorBar" +
                        this._divTag, d3.extent(
                            this.data[this.currentAxis]), [
                            20, 20
                        ]);
            } else {
                //readjust size
                this.svg = d3.select(this._div).select("svg")
                    .attr('width', $(this._div).parent().width())
                    .attr('height', $(this._div).parent().height());
            }

            //cleanup
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

            this.colorMap.callback(this.redraw.bind(this));
            this.vSelector.callback(this.updateAxis.bind(this));

            this.pc = d3.parcoords()(this._div + "pcDiv")
                .data(this.plotData)
                .color(d => this.colorMap.lookup(d[this.names[this.currentAxis]])) // quantitative color scale
                .margin({
                    top: 20,
                    left: 0,
                    right: 0,
                    bottom: 20
                })
                .alpha(0.35)
                .render()
                .brushMode("1D-axes") // enable brushing
                .interactive() // command line mode
                .reorderable();
            //register brush event
            this.pc.on("brush", brushed => {
                var indices = brushed.map(d => d['index']);
                // console.log('-----\n', indices, '-----\n');
                //hack
                if (indices.length === this.plotData.length) {
                    this.callback([]);
                    this.currentSubselect = 0;
                } else {
                    // console.log(this, this.callback)
                    if (this.callback) {
                        this.currentSubselect = indices.length;
                        this.callback(indices);
                    }
                }

            });
            // this.pc.on("clear")

        }
    }

    setBrushCallback(callback) {
        this.callback = callback;
    }

    resize() {
        this.draw();
        this._rehighlight();
    }

    highlight(listOfIndex = []) {

        if (this._isValid()) {
            // this.pc.brushReset();
            // console.log("=========reset brush===========");
            if (listOfIndex.length === 0) {
                if (this.highlightItems) {
                    this.pc.unhighlight(this.highlightItems);
                    this.highlightItems = undefined;
                }

                // this.pc.clear("highlight");
                // this.pc.clear("foreground");
            } else {
                this.highlightItems = listOfIndex.map(d => {
                    if (d >= 0)
                        return this.plotData[d];
                });
                this.pc.highlight(this.highlightItems);
            }
        }
    }


    redraw(colormap) {
        this.pc.render();
        this._rehighlight();
    }

    updateAxis(index) {
        this.currentAxis = index;
        this.colorMap.range(d3.extent(this.data[this.currentAxis]));
        this.pc.render();
    }

    _generatePlotData(data, names) {
        // var ndata = data.map
        // this.plotData = data[0].map((_, i)=>data.map(d=>d[i]));
        this.plotData = data[0].map((_, i) => {
            var obj = {};
            data.forEach(function(d, j) {
                obj[names[j]] = d[i];
            });
            obj["index"] = i;
            return obj;
        });
        // console.log(this.plotData);
    }

    _rehighlight() {
        if (this.highlightItems)
            this.pc.highlight(this.highlightItems);
    }

    _isValid() {
        return this.data && !d3.select(this._div).empty();
    }
}
