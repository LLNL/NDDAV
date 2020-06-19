class dynamicProjComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log(
            "########## dynamicProjComponent class ###########");
        this.addModule("DynamicProjModule", ["normalizedData", "projMat",
            "data"
        ]);
        this.dproj = new dynamicProjPlot(this.getDiv());
    }

    parseSignalCallback(msg) {
        // console.log(msg);
        if (msg['signal'] === 'normalizedData') {
            this.dproj.setNormalizedData(msg['data']['mat']);
        } else if (msg['signal'] === 'data') {
            this.dproj.setData(msg["data"]["data"]);
        } else if (msg['signal'] === 'projMat' || msg['data']['type'] ===
            'LP') {
            //init
            console.log(msg['data']);
            // if (this.currentMat === undefined)
            // || msg['data']['type'] ===        'LP'
            if (this.currentMat === undefined) {
                this.currentMat = msg['data']['mat'];
                this.dproj.setProjMat(msg['data']['mat']);

            } else {
                var sourceMat = this.dproj.getCurrentProjMat();
                var targetMat = msg['data']['mat'];
                this.callModule("computeDynamicProj", {
                    'source': sourceMat,
                    'target': targetMat
                });
                // this.dproj.setProjMat(msg['data']['mat']);
            }
        }
    }

    parseFunctionReturn(msg) {
        if (msg['function'] === 'computeDynamicProj') {
            // console.log(msg['data']);
            this.dproj.setProjMatList(msg['data']);
        }
    }
    resize() {
        this.dproj.resize();
    }
}
