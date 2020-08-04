var namespace = '/nddav'; //global namespace
//create a web socket connect to the server domain.
let address = 'http://' + document.domain + ':' + location.port;
// console.log("address:", address);
var socket = io.connect(address + namespace);

//for lookup component class on-the-fly
var constructorMap = {
  filterComponent: filterComponent,
  hdfileComponent: hdfileComponent,
  neighborhoodComponent: neighborhoodComponent,
  clusteringComponent: clusteringComponent,
  dimensionReductionComponent: dimensionReductionComponent,

  tableComponent: tableComponent,
  scatterplotsComponent: scatterplotsComponent,
  parallelcoordinatesComponent: parallelcoordinatesComponent,
  topospineComponent: topospineComponent,
  multiTopospineComponent: multiTopospineComponent,
  funcDistComponent: funcDistComponent,

  optimalAxisAlignComponent: optimalAxisAlignComponent,
  dynamicProjComponent: dynamicProjComponent,

  peakShapeComponent: peakShapeComponent,
  scatterplotPeelingComponent: scatterplotPeelingComponent,

  imageComponent: imageComponent,

  summaryparallelcoordinatesComponent: summaryparallelcoordinatesComponent,
  summaryscatterplotsComponent: summaryscatterplotsComponent,

  viewGraphComponenet: viewGraphComponenet
};

//for generating dragable side panel
var panelMetaInfo = {
  'Filtering': ['filter_view', 'filterComponent'],
  'HDFile': ['hdfile_view', 'hdfileComponent'],

  'Clustering': ['clustering_view', 'clusteringComponent'],
  'DimReduction': ['dimension_reduction_view', 'dimensionReductionComponent'],
  'Neighborhood': ['neighborhood_view', 'neighborhoodComponent'],
  'Scatter Plot': ['template_view', 'scatterplotsComponent'],
  'Parallel Coordinate': ['template_view', 'parallelcoordinatesComponent'],
  'Table': ['table_view', 'tableComponent'],

  'Topological Spine': ['template_view', 'topospineComponent'],
  'Topological Multi-Spine': ['template_view', 'multiTopospineComponent'],
  'FuncDistance': ['template_view', 'funcDistComponent'],

  'OptimalAxisAlign': ['template_view', 'optimalAxisAlignComponent'],
  'DynamicProjection': ['template_view', 'dynamicProjComponent'],

  'PeakShape': ['template_view', 'peakShapeComponent'],
  'PlotPeeling': ['template_view', 'scatterplotPeelingComponent'],

  'Image': ['template_view', 'imageComponent'],

  'Summary P.C.': ['template_view', 'summaryparallelcoordinatesComponent'],
  'Summary Scatter': ['template_view', 'summaryscatterplotsComponent'],

  "ViewGraph": ["template_view", 'viewGraphComponenet']
};

function registerComponent(appLayout, name) {
  //register factory callback
  appLayout.registerComponent(name, function(container, componentState) {
    // console.log("loading -- ", componentState);
    //popout test
    // console.log("container constructor:", componentState.name);
    // container.getElement().html( '<h2>' + componentState.name + '</h2>' );

    $.get('/views/' + componentState.route,
      function(template) {
        // var uuid = guid();
        var uuid = uuidv1();
        var data = {
          id: "div_" + uuid
        };
        var htmlComponent = Mustache.render(template, data);
        //create panel component
        var panel = container.getElement();
        panel.html(htmlComponent)
          // var panel = new window[componentState.name](uuid);
          //storge the object with panel
        var component = new constructorMap[componentState.name]
          (uuid);
        panel.data("component", component);
        container.on("resize", component.resize.bind(
          component));
      });
  });
}

var addMenuItem = function(title, route, name, layout) {
  var newItemConfig = {
    title: title,
    type: 'component',
    componentName: title,
    componentState: {
      route: route,
      name: name
    }
  };
  var element = $('<li>' + title +
    '<button type="button" class="pull-right btn-link" onclick="insertPanel(\'' +
    title + '\')" >' +
    '<span class="glyphicon glyphicon-plus"></span></button>' +
    '</li>');
  $('#menuContainer').append(element);

  // panelItemConfig[title] = newItemConfig;
  layout.createDragSource(element, newItemConfig);
};

// var appLayout = new window.GoldenLayout(testConfig, $('#layoutContainer'));
var layout = new glayout($('#layoutContainer'), panelMetaInfo, constructorMap);
layout.setAddMenuCallback(addMenuItem);
//setup layout

//handle whole window resize
window.addEventListener('resize', function() {
  // appLayout.updateSize();
  layout.getLayout().updateSize();
})

window.onbeforeunload = function(e) {
  console.log("@@@@@@@@@@@ reset module on server @@@@@@@@@\n");
  $.get("/", d => console.log(d));
};
