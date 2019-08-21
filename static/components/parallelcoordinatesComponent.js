class parallelcoordinatesComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log(
            "########## parallelcoordinatesComponent class ###########"
        );
        this.addModule("PlotModule", ["data", "subselection"]);//, "seg"]);
        this.pc = new parallelcoordinatesPlot(this.getDiv());
        this.pc.setBrushCallback(this.selectionCallback.bind(this));
    }

    parseSignalCallback(msg) {
        if (msg['signal'] === 'data') {
            var data = msg['data']['data'];
            var names = msg['data']['names'];
            this.pc.setData(data, names);
            console.log("data = ", data)
            // } else if (msg['signal'] === 'highlight') {
            //     var index = msg['data']['data'];
            //     // console.log('highlight: ', index);
            //     if (index === -1)
            //         this.pc.highlight();
            //     else
            //         this.pc.highlight([index]);

        } else if (msg['signal'] === 'subselection') {
            //crashing for subselection, bad looking subselection
            var listOfIndex = msg['data']['data'];
            // console.log('subselection: ', listOfIndex);
            // console.log("update subselection len:", listOfIndex.length);
            if (this.pc.currentSubselect === 0) {
                if (listOfIndex[0] === -1)
                    this.pc.highlight();
                else
                    this.pc.highlight(listOfIndex);
            }

        } else if (msg['signal'] === 'seg') {
            var seg = msg['data']['data'];
            // this.pc.setSeg(seg);

        }
    }

    parseFunctionReturn(msg) {

    }

    resize() {
        this.pc.resize();
    }

    selectionCallback(listOfIndex) {
        // console.log("set subselection len:", listOfIndex.length);
        this.setSignal("subselection", listOfIndex);
    }

    draw() {
        this.pc.draw();
    }
}
