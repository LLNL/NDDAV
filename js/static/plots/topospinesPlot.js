//dependency: ClipperLib
class topospinesPlot {
    constructor(div) {
        this._divTag = div;
        this._div = '#' + div;
        // this.colors = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };

        //init the persistence plot
        this.svg = d3.select(this._div).append("svg").attr("id", "topoSvg");
        this.pPlot = new persistencePlot(this.svg);
        this.pPlot.setComputeSpineCallback(this.computeSpine.bind(this));

        this.initScale = 1.0;
    }

    checkScale(){
        return this.initScale != this.scale();
    }

    setData(spines) {
        this.data = spines;
        this.updateDimSelector(this.data['rangeNames'], this.data['fname']);
        // console.log(this.data);
        this.draw();
    }

    setPersistence(persistence, variation) {
    
        this.pPlot.setData(persistence, variation);
        //init layout
        this.computeSpine();
    }

    computeSpine() {
        // Initial Layout 

        this.computeSpineCallback(this.pPlot.getCurrentPersistence(),
            this.pPlot.getCurrentVariation());
        // this.pPlot.computeTopoSpine
    }

    setComputationCallback(func) {
        this.computeSpineCallback = func;
    }

    setSelectionCallback(func) {
        this.selectExtrema = func;
    }

    setHoverFuncCallback(func) {
        this.hoverExtrema = func;
    }

    draw() {
        // console.log(this.data);
        if (this._isValid()) {
            this._updateWidthHeight();

            var funcValues = this.data.contourValues.map(d => Number(d))
                .concat(this.data.nodes.map(d => Number(d.functionValue)));

            this.svg.attr("width", this.pwidth).attr("height", this.pheight);

            if (!this.colorMap) {
                this.colorMap =
                    new d3UIcolorMap(this.svg, "spineColorBar" + this._divTag,
                        d3.extent(
                            funcValues),
                        this._cmOffset());
                this.csizeSlider =
                    new d3UIslider(this.svg, "ContourSize", [15, 100], this
                        ._sliderOffset());
                // this.layoutTypeSelector =
                //     new d3UIitemSelector(this.svg, ['graph', 'MDS', 'tSNE',
                //         'PCA'
                //     ], 0, [
                //         15, 180
                //     ], [100, 20]);
                // this.layoutTypeSelector.callback(this.computeSpine.bind(
                //     this))
                this.colorMap.callback(this.drawSpine.bind(this));
                this.csizeSlider.callback(this.computeSpine.bind(this));
                this.pPlot.pos([30, 5]);
            }

            this.colorMap.range(d3.extent(funcValues));

            this.drawSpine();
            this.colorMap.draw();
            this.csizeSlider.draw();
            // this.layoutTypeSelector.draw();
        }
    }

    layoutType() {
        // if (this.layoutTypeSelector) {
        //     // console.log()
        //     return this.layoutTypeSelector.selectionLable();
        // }
        return "graph";
    }

    scale() {
        
        var contourScale = this.initScale;
        if (this.csizeSlider){
            contourScale = this.csizeSlider.value() / 50.0;
            this.initScale = contourScale;
            }
        return contourScale;
    }

    resize() {
        if (this._isValid()) {
            this._updateWidthHeight();
            this.svg.attr("width", this.pwidth).attr("height", this.pheight);

            // this.csizeSlider.pos();
            this.pPlot.pos([30, 5]);

            if (this.colorMap)
                this.drawSpine();
        }
    }

    // drawSpineServer() {
    updateScale(xpos, ypos) {
        //console.log("Update Scale");
        //console.log(this.scale());
        var colorbarOffsetY = 180;
        var height = this.height;
        var width = this.width;
        var margin = 15;

        var xMin, yMin, xMax, yMax;
        xMin = Math.min.apply(null, xpos);
        xMax = Math.max.apply(null, xpos);
        yMin = Math.min.apply(null, ypos);
        yMax = Math.max.apply(null, ypos);

        this.cScale = d3.centerScale()
            .dataRect({
                x: xMin,
                y: yMin,
                width: xMax - xMin,
                height: yMax - yMin
            })
            .viewRect({
                x: 0,
                y: 0,
                width: width,
                height: height
            }, {
                top: colorbarOffsetY + margin,
                bottom: margin,
                left: margin,
                right: margin
            });
    }

    drawSpine() {
        // console.log("scale = ", this.scale());
        this.svg.select("#topospine").remove();
        var svgContainer = this.svg.append("g").attr("id", "topospine");
        // var contours = this.data['contourPath'];
        // var funcValueStrings = Object.keys(contours);

        var funcValueStrings = this.data['contourValues'];
        //should draw based on function value
        var sortedfuncValueStrings = funcValueStrings.sort(function(a, b) {
            return Number(a) - Number(b);
        });

        var xpos = [];
        var ypos = [];

        var lowestFuncString = sortedfuncValueStrings[0];
        var colorMap = this.colorMap.lookup.bind(this.colorMap);
        //if draw per function value path
        //draw regular contour without highlight

        if (!this.data.hasOwnProperty('contourSeg')) {
            // console.log("No ContourSeg Exists"); 
            this.regularContourData = JSON.parse(JSON.stringify(this.data));
            var contours = this.data['contourPath'];
            // for (var j = 0; j < sortedfuncValueStrings.length; j++) {
            var paths = contours[lowestFuncString];
            for (var k = 0; k < paths.length; k++) {
                var path = paths[k];
                for (var l = 0; l < path.length; l++) {
                    xpos.push(path[l][0]);
                    ypos.push(path[l][1]);
                }
            }
            
            this.updateScale(xpos, ypos);

            for (var j = 0; j < sortedfuncValueStrings.length; j++) {
                var key = sortedfuncValueStrings[j];
                var paths = contours[key];
                paths = paths.map(path => path.map(point => [this.cScale.x(
                        point[0]),
                    this.cScale.y(point[1])
                ]));
                var color = colorMap(Number(key));
                svgContainer.append('path')
                    .attr('d', this.paths2string(paths))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", color);
            }
        } 
        else {
            // draw per-extrema path

            // var t1, t2, t3, t4;

            // t1= new Date();
            
            var contourSeg = this.data['contourSeg'];
            // console.log(contourSeg);
            for (var index in contourSeg[lowestFuncString]) {
                var path = contourSeg[lowestFuncString][index]['path']
                    // var paths = contours[sortedfuncValueStrings[j]];
                    // for (var k = 0; k < paths.length; k++) {
                    // var path = paths[k];
                for (var l = 0; l < path.length; l++) {
                    xpos.push(path[l][0]);
                    ypos.push(path[l][1]);
                }
                // }
            }

            // t2 = new Date();
            // console.log(((t2 - t1)/1000) + " seconds");


            this.updateScale(xpos, ypos);

            var occupancyColor = d3.scale.linear()
                .domain([0.0, 1.0])
                .range(["white", "blue"]);

            for (var j = 0; j < sortedfuncValueStrings.length; j++) {
                var key = sortedfuncValueStrings[j];
                for (var index in contourSeg[key]) {
                    var pathObject = contourSeg[key][index];
                    var path = pathObject['path'];
                    path = path.map(point => [this.cScale.x(
                            point[0]),
                        this.cScale.y(point[1])
                    ]);
                    var color;
                    // console.log(pathObject);
                    var occupancy = Number(pathObject['occupancy']);
                    // console.log(occupancy);
                    //if (occupancy != 0.0) {
                    color = occupancyColor(occupancy);
                    // console.log(color);
                    svgContainer.append('path')
                        .attr('d', this.paths2string([path]))
                        .attr("stroke", "none")
                        // .attr("stroke", "black")
                        // .attr("stroke-width", 1)
                        .attr("fill", color);
                    //}
                }
            }

            // t3 = new Date();
            // console.log(((t3 - t2)/1000) + " seconds");

            //draw empty contours
            var contours = this.data['contourPath'];
            for (var j = 0; j < sortedfuncValueStrings.length; j++) {
                var key = sortedfuncValueStrings[j];
                var paths = contours[key];
                paths = paths.map(path => path.map(point => [this.cScale
                    .x(
                        point[0]),
                    this.cScale.y(point[1])
                ]));
                var color = colorMap(Number(key));
                // console.log(color);
                svgContainer.append('path')
                    .attr('d', this.paths2string(paths))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("fill", "none");
            }

            // t4 = new Date();
            // console.log(((t4 - t3)/1000) + " seconds");

        }

        this.drawSkeleton(svgContainer, this.data['link'], this.data[
                'nodes'],
            colorMap);

        //draw function name
        svgContainer.append('text')
            .attr('x', this.width - 150)
            .attr('y', this.height - 20)
            .text(this.data['fname'])
            .style('fill', 'black')
            .style("font-size", "18px");

    }

    ///////// update current function ////////
    setUpdateFuncCallback(func) {
        // if (this.dimSelector)
        //     this.dimSelector.callback(func);
        this.updateCurrentDimCallback = func;
    }

    updateDimSelector(names, currentName) {
        this.dimNames = names;
        if (this.dimSelector === undefined) {
            this.dimSelector = new d3UIitemSelector(this.svg, names,
                names.length -
                1, [
                    180, 10
                ]);

            this.dimSelector.callback(this.updateCurrentDimCallback);
        }
        this.dimSelector.updateSelectList(names);
        this.dimSelector.setCurrentName(currentName);
        //in filter module
    }

    getCurrentDimName() {
        if (this.dimSelector)
            return this.dimSelector.selectionLable();
    }

    ///////////// helper function //////////////

    drawSkeleton(svgContainer, spineLink, spineNode, colorMap) {
        var saddles = [];
        var extrema = [];
        var minContourSize = 5;

        //create saddle, extrema array
        for (var i = 0; i < spineLink.length; i++) {
            var index1 = Number(spineLink[i].split("-")[0]);
            var index2 = Number(spineLink[i].split("-")[1]);
            var node1, node2;
            // var saddleFlag = Math.min.apply(null, spineNode[index1].contourSize);
            // if (saddleFlag < 0) {
            if (Number(spineNode[index1].functionValue) < Number(
                    spineNode[
                        index2].functionValue)) {
                //index1 is saddle
                node1 = spineNode[index1];
                node2 = spineNode[index2];
            } else {
                node1 = spineNode[index2];
                node2 = spineNode[index1];
            }
            saddles.push(node1);
            extrema.push(node2);

            var saddleSize = minContourSize - 2;
            var extremaSize = minContourSize;
        }

        //draw dot
        // Define the div for the tooltip
        d3.select('body').select(this._div + 'nodelabel').remove();
        var div = d3.select('body').append("div")
            .attr("class", "tooltip")
            .attr('id', this._divTag + 'nodelabel')
            .style("opacity", 0);

        //saddle
        svgContainer.selectAll('saddle')
            .data(saddles)
            .enter()
            .append("circle")
            .attr("class", "saddle")
            .attr("cx", d => this.cScale.x(d.position[0]))
            .attr("cy", d => this.cScale.y(d.position[1]))
            .attr("r", saddleSize)
            .attr("fill", d => colorMap(d.functionValue))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .on("mouseover", d => {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("value:" + d3.format(".3f")(d.functionValue) +
                        "<br/>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) - 25 + "px");
                this.hoverExtrema(d.index);
                //console.log(d.index);
            })
            .on("mouseout", d=> {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                this.hoverExtrema(-1);
            })
            //maximum
            // console.log(node2.index);
        svgContainer.selectAll('extrema')
            .data(extrema)
            .enter()
            .append("circle")
            .attr("class", "extrema")
            .attr("cx", d => this.cScale.x(d.position[0]))
            .attr("cy", d => this.cScale.y(d.position[1]))
            .attr("r", extremaSize)
            .attr("fill", d => colorMap(d.functionValue))
            .attr("stroke", "black")
            .on('click', d => {
                if (this.selectExtrema)
                    this.selectExtrema(d.index);
            })
            .attr("stroke-width", 3)
            .on("mouseover", d => {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("value:" + d3.format(".3f")(d.functionValue) +
                        "<br/>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) - 25 + "px");
                this.hoverExtrema(d.index);
                //console.log(d.index);

            })
            .on("mouseout", d=> {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                this.hoverExtrema(-1);

            });
        // .on("mouseover", d => {
        //     div.transition()
        //         .duration(200)
        //         .style("opacity", .9);
        //     div.html("index:" + d.index + "<br/>")
        //         // .style("left", this.cScale.x(d.position[0]) +
        //         //     "px")
        //         // .style("top", this.cScale.y(d.position[1]) +
        //         //     "px");
        //         .style("left", (d3.event.pageX) + "px")
        //         .style("top", (d3.event.pageY) + "px");
        // })

    }

    paths2string(paths, scale) {
        var i, p, path, svgpath, _j, _len2, _len3;
        svgpath = '';
        if (!(scale != null))
            scale = 1;
        for (_j = 0,
            _len2 = paths.length; _j < _len2; _j++) {
            path = paths[_j];
            for (i = 0,
                _len3 = path.length; i < _len3; i++) {
                p = path[i];
                if (i === 0) {
                    svgpath += 'M';
                } else {
                    svgpath += 'L';
                }
                svgpath += p[0] / scale + ", " + p[1] / scale;
            }
            svgpath += 'Z';
        }
        if (svgpath === '')
            svgpath = 'M0,0';
        return svgpath;
    }

    ////////////////////// plot helper function //////////////////////

    _updateWidthHeight() {
        //resize width height
        //parent width, height
        this.pwidth = $(this._div).parent().parent().parent().width();
        this.pheight = $(this._div).parent().parent().parent().height();
        // console.log(this.pwidth, this.pheight);

        //setup single plot data
        this.width = this.pwidth - this.margin.left - this.margin.right;
        this.height = this.pheight - this.margin.top - this.margin.bottom;
        // console.log(this.width, this.height);
    }

    _isValid() {
        return this.data && !d3.select(this._div).empty();
    }

    _cmOffset() {
        return [30, 120];
    }

    _sliderOffset() {
        return [15, 140];
    }

}



/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
//multi-function topological spines
//json format for multi-function topoSpine
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////



class multiTopoSpinesPlot extends topospinesPlot {
    constructor(div) {
        super(div);
        this.pPlotComp = new persistencePlot(this.svg, [350, 5], [150,
                70
            ],
            "pPlotComp");
        this.pPlotComp.setComputeSpineCallback(this.computeCmpSpine.bind(
            this));

    }

    resize() {
        super.resize();
        this.drawCmpSkeleton();
    }

    updateDimSelector(names, currentName) {
        super.updateDimSelector(names, currentName);

        //init cmp selector with reference function
        if (this.cmpFuncSelector === undefined) {
            this.cmpFuncSelector = new d3UIitemSelector(this.svg, names, 0, [
                500,
                10
            ]);
            this.cmpFuncSelector.callback(this.updateCmpFuncCallback);

        }
        this.cmpFuncSelector.updateSelectList(names);
        this.cmpFuncSelector.setCurrentName(currentName);
        // console.log('updateCmpDimSelector', names);
    }

    updateCmpDimSelector(names, currentName) {
        // super.updateDimSelector(names, currentName);
        // this.cmpFuncSelector.updateSelectList(names);
        this.cmpFuncSelector.setCurrentName(currentName);
    }

    computeSpine() {
        console.log("recompute spine\n");
        super.computeSpine();
        this.computeCmpSpine();
    }

    getCmpDimName() {
        if (this.cmpFuncSelector)
            return this.cmpFuncSelector.selectionLable();
    }

    setUpdateCmpFuncCallback(func) {
        this.updateCmpFuncCallback = func;
    }

    setComputeCmpSpineCallback(func) {
        this.computeCmpSpineCallback = func;
    }

    setCmpPersistence(persistence, variation) {
        this.pPlotComp.setData(persistence, variation);
        //init layout
        this.computeCmpSpine();
    }

    computeCmpSpine() {
        if (this.pPlotComp.getCurrentPersistence()) {
            this.computeCmpSpineCallback(this.pPlotComp.getCurrentPersistence(),
                this.pPlotComp.getCurrentVariation());
            console.log('===>compute cmp spine', this.pPlotComp.getCurrentPersistence(),
                this.pPlotComp.getCurrentVariation());
        }
    }

    setCmpData(spineCmp) {
        // console.log(spineCmp);
        if (spineCmp) {
            this.updateCmpDimSelector(spineCmp['rangeNames'], spineCmp[
                'fname']);
            this.spineCmp = spineCmp;

            var funcValues = this.spineCmp.nodes.map(d => Number(d.functionValue));

            if (!this.colorMapCmp) {
                this.colorMapCmp = new d3UIcolorMap(this.svg,
                    "cmpColorBar" + this._divTag,
                    d3.extent(
                        funcValues), [350, 120]);
                this.colorMapCmp.callback(this.drawCmpSkeleton.bind(
                    this));
            }

            this.colorMapCmp.range(d3.extent(funcValues));
            this.drawCmpSkeleton();
        }
    }

    draw() {
        super.draw();
        this.drawCmpSkeleton();
    }

    //*
    drawCmpSkeleton() {
        // console.log("drawcmpSkeleton")
        if (this.spineCmp === undefined)
            return;

        var delta = 0.000001;
        var svgContainer = this.svg.select("#topospine");

        // console.log(this.spineCmp);
        // var spineData = JSON.parse(JSON.stringify(this.spineCmp));
        var spineData = this.spineCmp;
        var spineNode = spineData.nodes;
        var spineLink = spineData.link;

        var colorMap = this.colorMapCmp.lookup.bind(this.colorMapCmp);

        var saddles = {};
        var extrema = {};
        var links = [];

        ////////////////////////// input size scaling ////////////////////////
        var contourMax = 0;
        var contourMin = Number.MAX_VALUE;
        var minContourSize = 5;
        var maxContourSize = this.csizeSlider.value();
        var colorbarOffsetY = 180;
        var height = this.height;
        var width = this.width;
        var margin = 15;

        var lineGenerator = d3.svg.line().x(function(d) {
            return d[0];
        }).y(function(d) {
            return d[1];
        }).interpolate("linear");

        for (var i = 0; i < spineLink.length; i++) {
            var index1 = Number(spineLink[i].split("-")[0]);
            var index2 = Number(spineLink[i].split("-")[1]);
            var node1, node2;
            // var saddleFlag = Math.min.apply(null, spineNode[index1].contourSize);
            // if (saddleFlag < 0) {
            //node1 is saddle
            if (Number(spineNode[index1].functionValue) < Number(
                    spineNode[
                        index2].functionValue)) {
                node1 = spineNode[index1];
                node2 = spineNode[index2];
            } else {
                node1 = spineNode[index2];
                node2 = spineNode[index1];
            }
            // saddles.push(node1);
            saddles[node1.index] = node1;
            // extrema.push(node2);
            extrema[node2.index] = node2;
            //draw link
            var link = [
                [this.cScale.x(node1.position[0]), this.cScale.y(
                    node1.position[
                        1])],
                [this.cScale.x(node2.position[0]), this.cScale.y(
                    node2.position[
                        1])]
            ];
            links.push(link);

            var saddleSize = 6;
            var extremaSize = 15;
        }
        // console.log('saddle:', saddles);
        // console.log('extrema:', extrema);

        //draw lines
        svgContainer.selectAll('.lineCmp').remove();
        var cSkeleton = svgContainer.selectAll('.lineCmp')
            .data(links)
        cSkeleton.enter()
            .append("path")
            .attr("d", d => lineGenerator(d))
            .attr("stroke", "GreenYellow")
            .attr("stroke-width", 4)
            .attr("fill", "none")
            .attr("class", "lineCmp");
        // cSkeleton.exit().remove();

        //draw dot
        //saddle
        svgContainer.selectAll('.saddleCmp').remove();
        var cSaddles = svgContainer.selectAll('.saddleCmp')
            .data(Object.keys(saddles).map(d => saddles[d]));
        cSaddles.enter()
            .append("rect")
            .attr("class", "saddleCmp")
            .attr("x", d => this.cScale.x(d.position[0]) - saddleSize /
                2)
            .attr("y", d => this.cScale.y(d.position[1]) - saddleSize /
                2)
            .attr("width", saddleSize)
            .attr("height", saddleSize)
            .attr("fill", d => colorMap(d.functionValue))
            .attr("stroke", "green")
            .attr("stroke-width", 3)
            // cSaddles.exit().remove();
            //maximum
            // console.log(node2.index);
        svgContainer.selectAll('.extremaCmp').remove();
        var cExtrema = svgContainer.selectAll('.extremaCmp')
            .data(Object.keys(extrema).map(d => extrema[d]));
        cExtrema.enter()
            .append("rect")
            .attr("class", "extremaCmp")
            .attr("x", d => this.cScale.x(d.position[0]) - extremaSize /
                2)
            .attr("y", d => this.cScale.y(d.position[1]) - extremaSize /
                2)
            .attr("width", extremaSize)
            .attr("height", extremaSize)
            .attr("fill", d => colorMap(d.functionValue))
            .attr("stroke", "green")
            // .on('click', d => {
            //     // var index = Number(node2.index);
            //     // console.log(d);
            //     if (this.selectExtrema)
            //         this.selectExtrema(d.index);
            // })
            .attr("stroke-width", 3);
        // cExtrema.exit().remove();
    }
}
