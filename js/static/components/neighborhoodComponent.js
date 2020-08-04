class neighborhoodComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    console.log("########## neighborhoodComponent class ###########");
    this.addModule("NeighborhoodModule");
    this.callModule("getModuleInfoDict");
    this._setupUI();
  }

  parseFunctionReturn(msg) {
    if (msg['function'] === 'getModuleInfoDict') {
      var data = msg['data'];
      // console.log(data);
      var methods = data['methods'];
      var currentmethod = data['method'];
      var max_neighbor = Number(data['maxNeighbor']);
      var beta = data['beta'];
      // console.log("methods:", methods);

      methods.map(
        (value, index) => {
          $(this.div + 'neighbor_type').append("<option>" +
            value +
            "</option>");
        });
      $(this.div + 'neighbor_type').val(currentmethod);
      $(this.div + 'max_neighbor').val(max_neighbor);
      $(this.div + 'beta').val(beta);
    }
  }

  /////// cutomized function ///////
  computeNeighborhood() {
    var method = $(this.div + 'neighbor_type').val();
    var maxNeighbor = $(this.div + 'max_neighbor').val();
    var beta = $(this.div + 'beta').val();
    this.callModule("computeNeighborhoodByParams", {
      "method": method,
      "maxNeighbor": maxNeighbor,
      "beta": beta
    });
  }

  _setupUI() {
    $(this.div + 'BT_update').click(this.computeNeighborhood.bind(this));
  }
}
