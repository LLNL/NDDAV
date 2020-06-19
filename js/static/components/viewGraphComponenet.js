/*

Without python module, only link to dataHook

*/

class viewGraphComponenet extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.divTag = '#' + this.getDiv();
        // this.registerSignal()
        console.log(
            "########## viewGraphComponenet class ###########");
        this.addModule("ViewGraphModule", ["data", "viewGraph"]);
        // "normalizedData"
        this.colorList = ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1",
            "#018571"
        ];
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };
    }

    parseSignalCallback(msg) {
        if (msg["signal"] === "viewGraph") {
            this.matList = msg["data"]["matList"];
            // console.log(msg);
            this.callModule("viewGraphLayout");
        } else if (msg["signal"] === "data") {
            this.plotData = msg["data"]["data"];
            // console.log(this.plotData);
        }
    }

    parseFunctionReturn(msg) {
        if (msg["function"] === "viewGraphLayout") {
            // console.log(msg);
            this.layout = msg["data"];
            this.data = {
                "matList": this.matList,
                "layout": this.layout
            };
            console.log(this.data);
            this.draw();
        }
    }

    resize() {
        this.draw();
    }

    draw() {
        //layout
        if (this.data) {
            this.updateWidthHeight();
            this.width = this.pwidth;
            this.height = this.pheight;

            if (d3.select(this.divTag).select('svg').empty()) {
                this.svg = d3.select(this.divTag).append("svg")
                    .attr("id", "graphView")
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .style("position", "absolute");
                this.nodeList = [];
                this.rectList = [];
            } else {
                this.svg.attr('width', this.width)
                    .attr('height', this.height)
                    .style("position", "absolute");
            }

            //scale layout
            // console.log(this.width, this.height);
            // let size = [120, 120];
            let gsize = ((this.width < this.height) ? this.width : this.height) /
                5;
            let margin = 40
            let pos;
            let X = new Matrix(this.plotData);

            let x = d3.scale.linear()
                .domain(d3.extent(this.data.layout.map(
                    d => d[0])))
                .range([margin + gsize * 0.5, this.width - gsize * 0.5 -
                    margin
                ]);
            let y = d3.scale.linear()
                .domain(d3.extent(this.data.layout.map(
                    d => d[1])))
                .range([margin + gsize * 0.5, this.height - gsize * 0.5 -
                    margin
                ]);

            //go through projection matrix
            if (this.nodeList.length === 0) {
                for (let i = 0; i < this.data.matList.length; i++) {
                    pos = [x(this.data.layout[i][0]),
                        y(this.data.layout[i][1])
                    ];
                    console.log("pos", pos);

                    var node = new d3UIplotGlyph(this.svg, pos, [gsize,
                            gsize
                        ],
                        1,
                        false); //last entry is histo flag


                    var projMat = new Matrix(this.data.matList[i]);
                    projMat = projMat.T;
                    // console.log(projMat, X);
                    var projData = Matrix.multiply(projMat, X);

                    node.setData(projData.T.toArray(), this.plotData[this.plotData
                            .length - 1],
                        this.colorList);
                    this.nodeList.push(node);

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
                            this.updateProjMat(d);
                        })
                        .on('mouseover', function(d) {
                            d3.select(this).attr("fill", "powderblue");
                        })
                        .on('mouseout', function(d) {
                            d3.select(this).attr("fill", "white");
                        });
                    this.rectList.push(rect);
                }
            } else {
                for (var i = 0; i < this.nodeList.length; i++) {
                    pos = [x(this.data.layout[i][0]),
                        y(this.data.layout[i][1])
                    ];
                    this.nodeList[i].update(pos, [gsize, gsize]);
                    this.rectList[i].attr("x", pos[0] - 0.5 * gsize)
                        .attr("y", pos[1] - 0.5 * gsize)
                        .attr("width", gsize)
                        .attr("height", gsize);
                }
            }
        }
    }

    updateProjMat(index) {
        console.log("update projection", index, this.matList[index]);
        this.callModule("setCurrentProjMat", {
            "mat": this.matList[index]
        });
    }

    updateWidthHeight() {
        //resize width height
        //parent width, height
        this.pwidth = $(this.divTag).parent().parent().width();
        this.pheight = $(this.divTag).parent().parent().height();
        console.log(this.pwidth, this.pheight);

        //setup single plot data
        this.width = this.pwidth - this.margin.left - this.margin.right;
        this.height = this.pheight - this.margin.top - this.margin.bottom;
        // console.log(this.width, this.height);
    }
}
