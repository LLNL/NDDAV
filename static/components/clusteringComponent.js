class clusteringComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log("########## clusteringComponent class ###########");
        this.addModule("ClusteringModule");
        this.callModule("getModuleInfoDict");
        this._setupUI();
    }

    parseSignalCallback(msg) {
        if (msg['signal'] === 'output') {
            // var count = msg['clustercount'];
            // var method = msg['method'];
            // alert('Algorithm: ' + method + " with cluster count:" + count +
            //   ' is calculated');
        }
    }

    parseFunctionReturn(msg) {
        if (msg['function'] === "getModuleInfoDict") {
            var json = msg['data'];
            var method = json['method'];
            var methods = json['methods'];
            var clusterNum = json['clusterNum'];

            //update UI
            methods.map((value, index) => {
                $(this.div + 'cluster_method').append("<option>" +
                    value +
                    "</option>");
            })
            $(this.div + 'cluster_method').val(method);
            $(this.div + 'cluster_count').val(clusterNum);

        }
    }

    _setupUI() {
        //init UI
        $(this.div + "cluster").on("click", this.cluster.bind(this));

        for (var i = 2; i < 10; i++) {
            $(this.div + 'cluster_count').append("<option>" + i +
                "</option>");
        }
    }

    cluster() {
        var method = $(this.div + 'cluster_method').val();
        var count = $(this.div + 'cluster_count').val();
        this.callModule("setMethod", {
            "method": method
        });
        this.callModule("clusterCount", {
            "count": count
        });

        this.callModule("recompute");
    }
}
