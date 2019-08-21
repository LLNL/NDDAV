class scatterplotsComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log("########## scatterplotsComponent class ###########");
        this.addModule("PlotModule", ['data', 'subselection', 'seg', 'embedding']);
        this.sPlot = new scatterplots(this.getDiv());
        this.sPlot.bindSelectionCallback(this.selection.bind(this));
        this.sPlot.bindSubselectionCallback(this.subselection.bind(this));
    }

    parseSignalCallback(msg) {
        // console.log(msg);
        if (msg['signal'] === 'data') {
            var data = msg['data']['data'];
            var names = msg['data']['names'];
            console.log(msg['data']);
            this.sPlot.setData(data, names);
            // }
            // else if (msg['signal'] === 'highlight') {
            //     var index = msg['data']['data'];
            //     // console.log("scatterplotsCompononet:highlight=>", data);
            //     if (index === -1)
            //         this.sPlot.updateHighlight();
            //     else
            //         this.sPlot.updateHighlight([index]);
        } else if (msg['signal'] === 'subselection') {
            var listOfIndex = msg['data']['data'];
            // console.log(listOfIndex);
            this.sPlot.updateHighlight(listOfIndex);
        } else if (msg['signal'] === 'seg') {
            var seg = msg['data']['data'];
            var name = msg['data']['name'];
            this.sPlot.setSeg(seg);
        } else if (msg['signal'] === 'embedding') {
            var embedding = msg['data']['data'];
            var method = msg['data']['method'];
            // console.log(embedding, method);
            this.sPlot.updatePos(embedding[0], embedding[1], method);
        }
    }

    resize() {
        // console.log("scatterplot size event\n");
        this.sPlot.resize();
    }

    parseFunctionReturn(msg) {

    }

    selection(index) {
        this.setSignal("subselection", [index]);
    }

    subselection(listOfIndex) {
        this.setSignal("subselection", listOfIndex);
    }
}
