class filterComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        console.log("########## filterComponent class ###########");
        this.addModule("DataModule");
        this._setupUI();
    }

    loadFile(f) {
        // this.callModule("loadFile", {
        //     "filename": f
        // });
        console.log("filterConstructor=>loadFile\n");
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                this.callModule("loadData", {
                    "ustring": e.target.result,
                    "filename": f.name
                });

                this.callModule("getModuleInfoDict", {});
            };
        })(f).bind(this);

        reader.readAsText(f);
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

        $(this.div + 'file-input').on('change', function(e) {
            this.loadFile(e.target.files[0]);
            // console.log(e.target.files[0]);
        }.bind(this));

        $(this.div + 'load_function').on('click', function() {

            $(this.div + 'file-input').click();

            // this.loadFile('data/terrain1.txt');
            // this.loadFile('IF_Model.csv');
            // this.loadFile('data/iris.csv');
            // this.loadFile('data/Hwdp.float.csv');
            // this.loadFile('data/NIF_1D_Ensemble.csv');
            // this.loadFile('data/Hwdp_thd.csv');
            // this.loadFile('data/wineSmall.csv');
            // this.loadFile('hdanalysis/tools/simulationData10k.csv');

            // this.loadFile('hdanalysis/tools/simulationData90kIgnition.csv');
            //   this.loadFile('hdanalysis/tools/simulationData9k.csv');
            // this.loadFile('hdanalysis/tools/simulationData9k_exitStatus.csv');

            // this.loadFile('hdanalysis/tools/simulationData90k.csv');
            // this.loadFile('hdanalysis/tools/simulationData9k_BApressure.csv');
            // this.loadFile('hdanalysis/tools/simulationData9k_Ehs_final.csv');
            // "BApressure", #burn averaged hotspot pressure
            // "BAtion", #bur averaged ion temperature
            // "BTn", #neutron bangtime
            // "BTx", #x ray bangtime
            // #"BWn", #neutron burnwidth 9
            // "Ehs_final", #final internal energy in the hotspot
            // # "Ehs_initial", #initial internal energy this is always zero
            // "KE_initial", #initial kinetic energy
            // "MAXpressure", #peak pressure
            // "MAXrhoRhs", #peak hotspot rhoR
            // "MAXrhoRshell", #peak shell rhoR
            // "MAXtion", #peak ion temperature
            // "MINradius", #minimum radius
            // "MINradius_shock", #minimum shock radius
            // "RKE_%", #kinetic energy remaining
            // "Ye", #energy yield
            // "Yn", #neutron yield
            // "Yx" #x ray yield
        }.bind(this));

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
