class peakShapeComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log(
            "########## optimalAxisAlignComponent class ###########"
        );
        this.addModule("PeakShapeModule", ["data", "highlight",
            "subselection"
        ]);
        //FIXME highlight is used to distingish the difference between extrema
        // and the corresponding segment
        //FIXME add function signal cause python failure
        this.slab = new slabPlot(this.getDiv());
        this.slab.bindFocusIndexUpdate(this.updateFocusIndex.bind(this));
        this.slab.bindFocusPointUpdate(this.updateFocusPoint.bind(this));
        this.slab.bindHighlightUpdate(this.updateHighlight.bind(this));
        // this.slab.bindNodeCallback(this.nodeSelectionCallback.bind(this));
    }

    parseSignalCallback(msg) {
        if (msg['signal'] === 'data') {
            this.slab.setData(msg['data']['data'], msg['data']['names']);

        } else if (msg['signal'] === 'highlight') {
            var index = msg['data']['data'];
            // console.log("selected focus point:", index);
            if (index !== -1) {
                var focusDimIndex = this.slab.getFocusedDim();
                this.updateFocusIndex(index, focusDimIndex);

                // var point = this.slab.getPoint(index);

                // var slabSize = this.slab.getSlabSize();
                // this.updateFocusPoint(index, focusDimIndex, slabSize);

                // this.computeSegmentShape(index)
            }
        } else if (msg['signal'] === 'subselection') {
            var listOfIndex = msg['data']['data'];
            this.slab.setSubselection(listOfIndex);

        } else if (msg['signal'] === 'focusPoint') {
            var point = msg['data']['data'];
            var focusDimIndex = this.slab.getFocusedDim();
            var slabSize = this.slab.getSlabSize();
            this.updateFocusPoint(point, focusDimIndex, slabSize);
        }
    }


    parseFunctionReturn(msg) {
        if (msg['function'] === "updateFocusIndex" ||
            msg['function'] === "updateFocusPoint" ||
            msg['function'] === "computeSegmentShape") {
            this.slab.setDistanceList(msg['data']);
        }
    }

    resize() {
        this.slab.resize();
    }

    updateHighlight(index, focusDimIndex) {
        this.setSignal("highlight", index);
    }

    updateFocusPoint(index, focusDimIndex, slabSize) {
        this.callModule("updateFocusPoint", {
            "index": index,
            "focusDimIndex": focusDimIndex,
            "slabSize": slabSize
        });
    }

    updateFocusIndex(index, focusDimIndex) {
        this.callModule("updateFocusIndex", {
            "index": index,
            "focusDimIndex": focusDimIndex
        });

    }

    computeSegmentShape(index) {
        this.callModule("computeSegmentShape", {
            "index": index
        })
    }
}
