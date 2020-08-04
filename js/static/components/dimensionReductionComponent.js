class dimensionReductionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log(
            "########## dimensionReductionComponent class ###########");
        this.addModule("DimReductionModule");
        // this.callModule("getModuleInfoDict");
        this._setupUI();
    }

    parseSignalCallback(msg) {}

    parseFunctionReturn(msg) {

    }

    _setupUI() {
        $(this.div + "computeDR").on("click", this.dimReduction.bind(this));
    }

    dimReduction() {
        var method = $(this.div + 'dimReduction_method').val();
        // var method = "PCA"
        // var dim = Number($(this.div + 'dimReduction_dimension').val());
        var neighborCount = Number($(this.div + 'dimReduction_neighbors').val());
        // console.log(method, dim, neighborCount)
        this.callModule("setMethod", {
            "method": method
        });
        this.callModule("embeddingDimension", {
            "dim": 2
        });
        this.callModule("neighborCount", {
            "count": neighborCount
        });

        this.callModule("recompute");
    }
}
