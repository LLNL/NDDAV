class scalablePlot extends basePlot {
    constructor(div) {
        this.margin = {
            top: 50,
            right: 20,
            bottom: 55,
            left: 45
        };
        this.listOfIndex = [-1];
    }

    setData(data, names, domain = [0, 1], values = [2]) {
        this.data = data;
        this.names = names;
        this.xIndex = domain[0];
        this.yIndex = domain[1];
        this.vIndex = values[0];
        this.draw();
    }

    draw() {

    }



}
