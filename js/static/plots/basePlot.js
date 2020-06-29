class basePlot {
    constructor(div) {
        this._divTag = div;
        this._div = '#' + div;

        //default margin
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };
    }

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
}
