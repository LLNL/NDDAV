class hdfileComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    console.log("########## hdfileComponent class ###########");
    this.addModule("HDFileModule");
    this._setupUI();
  }

  loadFile(f) {
    console.log("hdfileComponent=>loadFile", f.name);
    //var selectedDim=document.getElementById("data_cube").value;

    var mycheck = document.getElementById("cube_dim").checked;
    var selectedDim;

    if(mycheck)
      selectedDim = 3;
    else
      selectedDim = 2;

    console.log(selectedDim);

    this.callModule("load", {
      "filename": f.name,
      "isIncludeFunctionIndexInfo":false, 
      "cube_dim": parseInt(selectedDim)
    });
  }

  parseFunctionReturn(msg) {
      console.log(msg)
      switch (msg['function']) {}
    } //end of parseFunctionReturn()

  _setupUI() {
    $(this.div + 'file-input').on('change', function(e) {
      this.loadFile(e.target.files[0]);
      console.log(e.target.files[0]);
    }.bind(this));

    //relay the load function button to file-input
    $(this.div + 'load_function').on('click', function() {
      $(this.div + 'file-input').click();
    }.bind(this));

  }
} //end of class
