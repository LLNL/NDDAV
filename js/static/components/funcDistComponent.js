class funcDistComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log("########## baseComponent class ###########");
        this.addModule("FuncDistModule", ['subselection']);
        this.hMap = new heatmapPlot(this.getDiv());
    }

    parseSignalCallback(msg) {
        if (msg['signal'] === 'subselection') {
            //crashing for subselection, bad looking subselection
            var listOfIndex = msg['data']['data'];
            // if (listOfIndex.length > 1) {
            // console.log('subselection: ', listOfIndex);
            this.callModule("computeDistFromSelection", {
                'listOfIndex': listOfIndex,
                'methodType': 'correlation'
            });
            // }
        }
    }

    parseFunctionReturn(msg) {
        if (msg['function'] === "computeDistFromSelection") {
            // console.log(msg['data']);
            var data = msg['data'];
            // console.log(data['matrix']);
            this.hMap.setData(data['matrix'], data['names'], data[
                'distType']);
        }
    }

    resize() {
        this.hMap.resize();
    }
}
