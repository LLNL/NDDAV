class dynamicProjPlot extends basePlot {
    constructor(div) {
        super(div);
        this.canvas = d3.select(this._div).append("canvas")
            .attr("id", "canvas" + this._divTag);
        // this.colorList = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8",
        //     "#253494"
        // ];
        this.colorList = ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1",
            "#018571"
        ];
        // this.colorList = ["red", "orange", "green"];
        // this.colorList = d3.scale.category10().range();
    }

    setData(data) {
        this.data = data;
        this.values = data[data.length - 1];
    }

    setNormalizedData(data) {
        this.data = data;
        this.X = new Matrix(this.data);
        // this.values = this.X.toArray()[0];
        // console.log(this.X);
    }

    setProjMat(projMat) {
        this.projMat = new Matrix(projMat);
        // console.log(this.projMat.T, this.X);
        // if (this.X) {
        this.emb = this.projMat.T.multiply(this.X).T.toArray();
        // console.log(this.emb);
        this.draw();
        // }
    }


    getCurrentProjMat() {
        return this.projMat.toArray();
    }

    setProjMatList(projMatList) {
        //if there is a projection already
        // console.log(projMatList);
        var that = this;
        if (this.projMat) {
            var i = 0;
            requestAnimationFrame(step.bind(this));

            function step() {
                this.projMat = new Matrix(projMatList[i]);
                this.emb = this.projMat.T.multiply(this.X).T.toArray();
                // console.log(this.emb);
                this.draw();

                i++;

                var id = requestAnimationFrame(step.bind(that));
                if (i === projMatList.length) {
                    cancelAnimationFrame(id);
                }
            }
        }
    }

    draw() {
        //draw basic plot
        if (this._isValid() && this.emb !== undefined && this.values) {
            this._updateWidthHeight();
            this.width = this.pwidth;
            this.height = this.pheight;
            // console.log(this.width, this.height);

            this.scaleX = d3.scale.linear().domain(
                d3.extent(this.emb.map(d => d[0]))).range([5, this.width -
                15
            ]);
            this.scaleY = d3.scale.linear().domain(
                d3.extent(this.emb.map(d => d[1]))).range([5, this.height -
                15
            ]);

            var cmrange = [];
            var cmlen = this.colorList.length;
            var range = d3.extent(this.values);
            for (var i = 0; i < cmlen; i++) {
                cmrange.push(range[0] + (i / (cmlen - 1)) * (range[
                    1] - range[0]));
            }
            this.colorMap = d3.scale.linear()
                .domain(cmrange)
                .range(this.colorList);

            // this.colorMap = d3.scale.linear()
            //     .domain(d3.extent(this.values))
            //     .range(['green', 'blue']);
            this.canvas
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this.width)
                .attr("height", this.height);

            this.fCanvas = new fabric.StaticCanvas("canvas" + this._divTag, {
                // backgroundColor: "#000",
                renderOnAddRemove: false
            });
            for (var i = 0; i < this.emb.length; i++) {
                var dot = new fabric.Circle({
                    left: this.scaleX(this.emb[i][0]),
                    top: this.height - 5 - this.scaleY(this.emb[i][
                        1
                    ]),
                    radius: this.width / 120.0,
                    fill: this.colorMap(this.values[i]),
                    stroke: "black",
                    objectCaching: false
                });
                this.fCanvas.add(dot);
            }
            this.fCanvas.renderAll();
        }


    }
    resize() {
        this.draw();
    }
}
