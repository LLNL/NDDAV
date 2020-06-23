var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

var NDDAVDisplayModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'NDDAVDisplayModel',
        _view_name : 'NDDAVDisplay',
        _model_module : 'nddav_nbextension',
        _view_module : 'nddav_nbextension',
        _model_module_version : '^1.1 || ^2 || ^3',
        _view_module_version : '^1.1 || ^2 || ^3',
    })
});


// Custom View. Renders the widget model.
var NDDAVDisplayView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function() {
        this.port = this.model.get('_port_number');

        this.display = document.createElement('IFrame');
        console.log(this.port);
        this.display.setAttribute("src", "http://127.0.0.1:"+this.port);
        this.display.style.width = "800px";
        this.display.style.height = "800px";
        this.el.appendChild(this.display);
        console.log(this.display);
    }
});


module.exports = {
    NDDAVDisplayModel: NDDAVDisplayModel,
    NDDAVDisplayView: NDDAVDisplayView
};