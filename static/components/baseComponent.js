// console.log('http://' + document.domain + ':' + location.port +
// namespace);

class baseComponent {
  constructor(uuid) {
    // this.uuid = guid();
    // this.div = "#div_" + this.uuid;
    this.uuid = uuid;
    this.div = "#" + this.uuid;
    socket.on(this.uuid, this.parseMessage.bind(this));
    // console.log("########## based class ###########"+this.uuid);
  }

  getDiv() {
    return this.div.slice(1, this.div.length);
  }

  resize() {

  }

  // this function will be extended by the subclasses
  parseSignalCallback(msg) {
    // console.log("parse signal callback base\n");
  }

  // this function will be extended by the subclasses
  parseFunctionReturn(msg) {
    //console.log("parse function return base\n");
  }

  parseDataUpdate(msg) {
    //console.log("parse data return base\n");
  }

  parseMessage(msg) {
    // console.log("\nparse message in base class\n", msg);
    switch (msg['type']) {
      case 'signalCallback':
        this.parseSignalCallback(msg);
        break;
      case 'functionReturn':
        this.parseFunctionReturn(msg);
        return;
      case 'data':
        this.parseDataUpdate(msg);
    }
  }

  // subscribeData(dataType) {
  //     var msg = {
  //         "type": "subscribeData",
  //         "name": "dataType",
  //         "uid": this.uuid
  //     };
  //     socket.emit("message", msg);
  // }
  //
  //
  // setData(data, dataType) {
  //     this.data[name] = data;
  //     var msg = {
  //         "type": "setData",
  //         "name": name,
  //         "data": data,
  //         "uid": this.uuid
  //     };
  //     // console.log(msg);
  //     socket.emit('message', msg);
  // }

  // register callback signal
  registerSignal(signal) {
    var msg = {
      "type": "registerSignal",
      "uid": this.uuid,
      "signal": signal
    };
    socket.emit('message', msg);
    //console.log("registerSignal", msg);
  }

  //set signal value in module
  setSignal(signal, value) {
    var msg = {
      "type": "setSignal",
      "uid": this.uuid,
      "signal": signal,
      "value": value
    };
    socket.emit('message', msg);
    //console.log("setSignal", msg);
  }

  addModule(moduleName, listOfSignals = [], trackSignal = true) {
    var msg = {
      "type": "addModule",
      "uid": trackSignal ? this.uuid : -1,
      "moduleName": moduleName,
      "listOfSignals": listOfSignals
    };
    // console.log(msg);
    socket.emit('message', msg);
    //console.log("addModule", msg, "moduleName: ", moduleName, "listofSignals: ", listOfSignals);
  }

  removeModule() {
    var msg = {
      "type": "removeModule",
      "uid": this.uuid
    };
    // console.log(msg);
    socket.emit('message', msg);
  }

  callModule(func, parameter = {}) {
    //{} indicate no parameter
    // console.log(func, parameter);
    var msg = {
      "type": "callModule",
      "uid": this.uuid,
      "function": func,
      "parameter": parameter
    };
    socket.emit('message', msg);
    //console.log("callMod", msg);
  }

  updateWidthHeight() {
    //resize width height
    //parent width, height
    this.width = $(this.div).parent().parent().width();
    this.height = $(this.div).parent().parent().height();
    // console.log(this.pwidth, this.pheight);

    //setup single plot data
    // this.width = this.pwidth - this.margin.left - this.margin.right;
    // this.height = this.pheight - this.margin.top - this.margin.bottom;
    // console.log(this.width, this.height);
  }

}
