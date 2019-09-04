class filterComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    console.log("########## filterComponent class ###########");
    this.addModule("DataModule");
    this._setupUI();

    this.fileToUpload = null;
  }

  loadFile() {
    console.log("load file on server side\n");
    if (this.fileToUpload) {
      this.callModule("loadFile", {
        "filename": "upload/" + this.fileToUpload.name
      });

      this.callModule("getModuleInfoDict", {});
    }
  }

  sendFile(file) {
    this.fileToUpload = file;
    var formData = new FormData();
    var request = new XMLHttpRequest();
    formData.set('file', file)
    request.open("POST", '/upload')
    request.send(formData);
    // request.done(()=>{this.loadFile});
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        console.log('request.readyState=', request.readyState);
        console.log('request.status=', request.status);
        console.log('response=', request.responseText);

        this.loadFile();
        // var data = JSON.parse(request.responseText);
        // var uploadResult = data['message']
        // console.log('uploadResult=',uploadResult);
        //
        // if (uploadResult=='failure'){
        //    console.log('failed to upload file');
        //    // displayError('failed to upload');
        // }else if (uploadResult=='success'){
        //    console.log('successfully uploaded file');
        //    this.loadFile();
        // }
      }
    }.bind(this);
  }

  parseFunctionReturn(msg) {
      console.log(msg)
      switch (msg['function']) {
        case "getModuleInfoDict":
          var JSONdata = msg['data'];
          var domain = JSONdata['domain'];
          var range = JSONdata['range'];
          var norm = JSONdata['norm'];
          var vars = JSONdata['vars'];

          console.log(domain, range, vars);
          // $(this.div).parent().css("overflow-y", "scroll");

          var func = '[' + domain.toString() + '] -> ' + range;
          $(this.div + 'function').val(func);

          $.each(vars, function(index, d) {

            $(this.div + 'function_domain').append(
              "<input type='checkbox' value=" +
              d +
              " >" + d + "<br>");
            $(this.div + 'function_range').append(
              " <input type='radio' name='range' value=" +
              d + " >" + d +
              "<br>");
          }.bind(this));

          //add dummpy option for ignoring the function value
          // $(this.div + 'function_range').append(
          //     "<input type='radio' value='_'>_<br>"
          // );

          $.each(domain, function(index, d) {
            $(this.div + "function_domain [value='" + d +
              "']").prop(
              'checked', true);
          }.bind(this));

          $(this.div + "function_range [value='" + range + "']").prop(
            'checked',
            true);
      }
    } //end of parseFunctionReturn()

  setFunction(domain, range, norm) {
    // console.log(domain, range, norm);
    this.callModule("setFunction", {
      "domain": domain,
      "range": range,
      "norm": norm
    });
  }

  _setupUI() {
    $(this.div + 'define_function').on('click', function() {
      $(this.div).parent().css("overflow-y", "scroll");
      $(this.div + 'function_dialog').fadeIn(500);
    }.bind(this));

    $(this.div + 'dialog_cancel').on('click', function() {
      $(this.div).parent().css("overflow-y", "hidden");
      $(this.div + 'function_dialog').fadeOut(500);
    }.bind(this));

    $(this.div + 'dialog_apply').on('click', function() {
      $(this.div).parent().css("overflow-y", "hidden");
      $(this.div + 'function_dialog').fadeOut(500);
      this._function_change();
    }.bind(this));

    // upload file to server
    $(this.div + 'file-input').on('change', function(e) {
      this.sendFile(e.target.files[0]);
    }.bind(this));

    $(this.div + 'select_file').on('click', function() {
      $(this.div + 'file-input').click();
    }.bind(this));

    // load file on the server
    // $(this.div + 'load_file').on('click', function() {
    //     this.loadFile();
    // }.bind(this));
  }

  //load local file
  _loadFileToJSON(filename) {

  }

  _function_change() {
    var domain = []
    $.each($(this.div + 'function_domain [type="checkbox"]:checked'),
      function() {
        domain.push($(this).val());
      });
    var range = $(this.div + 'function_range [type="radio"]:checked').val();
    var norm = $(this.div + 'normType [type="radio"]:checked').val();

    $('#function_dialog').fadeOut(500);

    this.setFunction(domain, range, norm);
  }

} //end of class
