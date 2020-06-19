var plugin = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'nddav_nbextension',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'nddav_nbextension',
          version: plugin.version,
          exports: plugin
      });
  },
  autoStart: true
};

