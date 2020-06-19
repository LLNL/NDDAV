var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
//var nddav_helper = require('./nddav_helper.js');

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
        var randomStr = (
            Math.random().toString(36).substring(2, 5) +
            Math.random().toString(36).substring(2, 5)
        );
        this.model.set('dom_element_id', randomStr);

        this.container = document.createElement('div');
        this.container.setAttribute('id', randomStr);
        this.display = document.createElement('div');

        /*this.nddav = nddav_helper.viewer(this.hgDisplay);

        this.container.api = this.hg;*/
    }
});


module.exports = {
    NDDAVDisplayModel: NDDAVDisplayModel,
    NDDAVDisplayView: NDDAVDisplayView
};