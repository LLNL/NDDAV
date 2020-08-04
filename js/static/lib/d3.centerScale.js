d3.centerScale = function() {
  var dataRect, viewRect, margin;
  var dataAspectRatio, viewAspectRatio;
  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();

  function scale() {

  }

  scale.dataRect = function(rect) {
    dataRect = rect;
    dataAspectRatio = rect.width / rect.height;
    xScale.domain([rect.x, rect.x + rect.width]);
    yScale.domain([rect.y, rect.y + rect.height]);
    return scale;
  }

  scale.viewRect = function(rect, mar) {
    viewRect = rect;
    margin = mar;
    viewRect.x = viewRect.x + mar.left;
    viewRect.y = viewRect.y + mar.top;
    viewRect.width = viewRect.width - mar.left - mar.right;
    viewRect.height = viewRect.height - mar.top - mar.bottom;

    viewAspectRatio = viewRect.width / viewRect.height;
    return scale;
  }

  scale.x = function(x) {
    if (viewAspectRatio > dataAspectRatio) {
      //zoom ratio
      var zoomRatio = viewRect.height / dataRect.height;
      //x centering
      var padding = viewRect.width - dataRect.width * zoomRatio;
      xScale.range([viewRect.x + padding * 0.5,
        viewRect.x + viewRect.width - 0.5 * padding
      ]);
    } else {
      //x full scale
      xScale.range([viewRect.x, viewRect.x + viewRect.width]);
    }

    return xScale(x);
  }

  scale.y = function(y) {
    var coordY;
    if (viewAspectRatio > dataAspectRatio) {
      //y full scale
      yScale.range([viewRect.y, viewRect.y + viewRect.height]);

    } else {
      //y centering
      var zoomRatio = viewRect.width / dataRect.width;
      var padding = viewRect.height - dataRect.height * zoomRatio;
      yScale.range([viewRect.y + 0.5 * padding,
        viewRect.y + viewRect.height - 0.5 * padding
      ]);

    }
    return yScale(y);
  }

  return scale;
}
