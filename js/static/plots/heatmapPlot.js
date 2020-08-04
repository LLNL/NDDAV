class heatmapPlot extends basePlot {
    constructor(div) {
        super(div);
        this.margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        };
        this.isSymmetric = true;
        this.colorMap = d3.scale.linear().domain([-1.0, 0.0, 1.0]).range([
            "red",
            "white",
            "lawngreen"
        ]);
    }

    setData(matrix, names, distType) {
        this.data = matrix;
        this.names = names;
        this.distType = distType;
        this.draw();
    }

    draw() {
        this._updateWidthHeight();
        if (this.data) {
            if (this.data.length == 1)
                return;
            d3.select(this._div).select('svg').remove();
            this.svg = d3.select(this._div).append('svg')
                .attr('width', this.pwidth)
                .attr('height', this.pheight)
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + "," +
                    this.margin.top + ")");

            this.svg.append('text')
                .attr('x', this.width - 100)
                .attr('y', 20)
                .text(this.distType)
                .style('fill', 'black')
                .style("font-size", "20px");

            // this.svg.selectAll().remove();
            for (var i = 0; i < this.data.length; i++)
                for (var j = 0; j < this.data[i].length; j++) {
                    if (this.isSymmetric)
                        if (i > j)
                            continue;

                    this.svg.append('rect')
                        .attr('x', this.width / this.data.length * i)
                        .attr('y', this.height / this.data[i].length * j)
                        .attr('width', this.width / this.data.length)
                        .attr('height', this.height / this.data[i].length)
                        .attr('fill', this.colorMap(this.data[i][j]))
                        .style('stroke', 'white')
                        .style('stroke-width', '2');
                    //draw text
                    if (i === j) {
                        this.svg.append('text')
                            .attr('x', this.width / this.data.length * (i +
                                0.05))
                            .attr('y', this.height / this.data[i].length *
                                (j + 0.55))
                            .text(this.names[i] + '(' + d3.format(".1f")(
                                this.data[i][j]) + ')')
                            .style('fill', 'black')
                            .style("font-size", "15px");
                    } else {
                        this.svg.append('text')
                            .attr('x', this.width / this.data.length * (i +
                                0.3))
                            .attr('y', this.height / this.data[i].length *
                                (j + 0.55))
                            .text(d3.format(".3f")(this.data[i][j]))
                            .style('fill', 'black')
                            .style("font-size", "15px");
                    }
                }


        }
    }

    resize() {
        this.draw();
    }
}
