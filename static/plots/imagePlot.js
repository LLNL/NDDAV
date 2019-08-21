/*

Need to resolve embed canvas in svg issues

*/
class imagePlot extends basePlot {
    constructor(svg, type) {
        this.imageType = type;
        this.svg = svg;

    }

    setData(data) {
        this.data = data;
        this.draw();
    }

    draw() {
        if (this.data) {
            this.updateWidthHeight();
            //draw image
            var size = Math.min(this.width, this.height);
            d3.select(this.div).selectAll("*").remove();
            var canvas = d3.select(this.div)
                .append('canvas')
                .style({
                    position: 'absolute',
                    width: size + 'px',
                    height: size + 'px'
                })
                .attr({
                    width: 50,
                    height: 50
                })
                .node();

            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var ctx = canvas.getContext('2d');
            var imageData = ctx.getImageData(0, 0, canvasWidth,
                canvasHeight);

            var buf = new ArrayBuffer(imageData.data.length);
            var buf8 = new Uint8ClampedArray(buf);
            var data = new Uint32Array(buf);

            for (var y = 0; y < canvasHeight; ++y) {
                for (var x = 0; x < canvasWidth; ++x) {
                    var value = this.data[y * canvasWidth + x];
                    if (this.imageType === 'color') {
                        data[y * canvasWidth + x] =
                            (255 << 24) | // alpha
                            (value / 2 << 16) | // blue
                            (value << 8) | // green
                            255; // red
                    } else {
                        data[y * canvasWidth + x] =
                            (255 << 24) | // alpha
                            (value << 16) | // blue
                            (value << 8) | // green
                            value; // red
                    }
                }
            }

            imageData.data.set(buf8);

            ctx.putImageData(imageData, 0, 0);
        }
    }
