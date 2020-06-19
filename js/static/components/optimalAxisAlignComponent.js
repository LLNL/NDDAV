class optimalAxisAlignComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log(
            "########## optimalAxisAlignComponent class ###########"
        );
        this.addModule("OptimalAxisAlignModule", ["data", "seg"]);
        this.op = new optimalAxisAlignPlot(this.getDiv());
        this.op.bindNodeCallback(this.nodeSelectionCallback.bind(this));
    }

    parseSignalCallback(msg) {
        if (msg['signal'] === 'seg') {
            console.log(msg['data']['data']);
            // this.op.updateSeg(msg['data']);
        } else if (msg['signal'] === 'data') {
            this.op.setPlotData(msg['data']['data'], msg['data']['names']);
            //trigger compute
            this.callModule("computeDecomposition");
        }
    }

    parseFunctionReturn(msg) {
        if (msg['function'] === "computeDecomposition") {
            this.op.setDecomposition(msg['data']);
        }
    }

    resize() {
        this.op.resize();
    }

    nodeSelectionCallback(type, index) {
        this.callModule("setProjMat", {
            "type": type,
            "index": index
        });
    }
}
