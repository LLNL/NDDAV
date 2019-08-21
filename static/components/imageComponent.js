class imageComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log("########## imageComponent class ###########");

        this.addModule("ImageModule", ["image", "selectedImages",
            "subselection"
        ]);
        this.colorList = ["white", "darkgreen"];
        this.colorMap = d3.scale.linear()
            .domain([0, 1.0])
            .range(this.colorList);
    }

    parseSignalCallback(msg) {
        if (msg["signal"] === 'image') {
            var data = msg["data"]["data"];
            // console.log(data);
            //!!!!!!!! FIXME !!!!!!!
            // if (data[0] === -1)
            //     return;
            this.data = data; //.map(d => 255 * d);
            this.images = undefined;
            this.imageType = "color";
            this.draw();
        } else if (msg["signal"] === 'selectedImages') {
            var data = msg["data"]["data"];
            console.log("recieved selected images\n", data);
            this.images = data;
            this.data = undefined;
            this.draw();
        } else if (msg["signal"] === 'subselection') {
            var listOfIndex = msg['data']['data'];

            this.clearDrawing();
            if (listOfIndex[0] !== -1) {
                // console.log("call imageLookup", listOfIndex);
                this.callModule("imageLookup", {
                    "indices": listOfIndex
                })
            } else {
                this.clearDrawing();
            }
        }
    }

    resize() {
        this.draw();
    }

    clearDrawing() {
        d3.select(this.div).selectAll("*").remove();
    }

    drawSingle() {
        this.updateWidthHeight();
        d3.select(this.div).selectAll("*").remove();
        var size = Math.min(this.width, this.height);
        this.drawImage([0, 0], [size, size], this.data);
    }

    drawGrid() {
        this.updateWidthHeight();
        d3.select(this.div).selectAll("*").remove();
        let ii = 4;
        var size = this.width / ii - 5;
        let jj = Math.floor(this.height / (size + 5));

        // console.log(ii, jj);
        let index = 0;
        for (let i = 0; i < ii; i++)
            for (let j = 0; j < jj; j++) {
                if (index < this.images.length) {
                    if (index < 2) {
                        this.imageType = "grey";
                    } else {
                        this.imageType = "color"
                    }
                    let data = this.images[index];

                    this.drawImage(
                        [j * size + 2.5, i * size + 2.5], [size,
                            size
                        ],
                        data
                    );
                }
                index = index + 1;
            }
    }

    resize() {
        this.draw();
    }

    draw() {
        // var imageData = this.data;
        if (this.data) {
            this.drawSingle();
        } else if (this.images) {
            this.drawGrid();
        }
    }

    drawImage(pos, size, image) {
        //draw image
        if (image && image.length !== 0) {
            // console.log(image);
            var canvas = d3.select(this.div)
                .append('canvas')
                .style({
                    // position: 'relative',
                    left: pos[0] + 'px',
                    top: pos[1] + 'px',
                    width: size[0] + 'px',
                    height: size[1] + 'px'
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

            var min = Math.min.apply(null, image);
            var max = Math.max.apply(null, image);
            image = image.map(d => (d - min) / (max - min));

            for (var y = 0; y < canvasHeight; ++y) {
                for (var x = 0; x < canvasWidth; ++x) {
                    var value = image[y * canvasWidth + x];
                    if (this.imageType === 'color') {
                        // var color = d3.interpolateViridis(value);
                        var color = d3.color(this.colorMap(value));
                        // console.log(color, this.colorMap(value), value);

                        data[y * canvasWidth + x] =
                            (255 << 24) | // alpha
                            (color.b << 16) | // blue
                            (color.g << 8) | // green
                            color.r; // red
                    } else {
                        value = value * 255;
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
}
