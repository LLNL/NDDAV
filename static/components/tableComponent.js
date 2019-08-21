class tableComponent extends baseComponent {
  constructor(uuid) {
    super(uuid);
    console.log("########## tableComponent class ###########");
    this.addModule("PlotModule", ["data", "subselection", "highlight"]);
  }

  parseSignalCallback(msg) {
    //generate table
    if (msg['signal'] === 'data') {
      console.log("tableComponent=>data\n");
      var data = msg['data']['data'];
      var names = msg['data']['names'];
      // this.sPlot.setData(data, names);
      // generate table
      $(this.div).parent().css("overflow-y", "scroll");
      // $(this.div).append("<table class=\"table table-striped\">" +
      //   "<thead > < /thead> < tbody > < /tbody> < /table>");

      var thead = d3.select(this.div + ' thead');
      var tbody = d3.select(this.div + ' tbody');
      names.unshift(
        'index');
      if (thead.select('tr').empty())
        thead.append('tr');
      thead.select('tr').selectAll('th').data(names)
        .enter().append('th').text(d => d);

      data.unshift(data[0].map((_, i) => i));
      // console.log(data);
      var TR = tbody.selectAll('tr').data(zip(data)).enter().append('tr')
        .on('click', (d, i) => {
          this.setSignal("highlight", i);
        });
      var td = TR.selectAll("td").data(function(v, i) {
          return v;
        }).enter().append('td')
        .text(function(d, index) {
          if (index == 0)
            return d;
          return d.toFixed(3);
        });
      //////////////// highlight /////////////////
    } else if (msg['signal'] === 'highlight') {
      var index = msg['data']['data'];
      d3.select(this.div + ' tbody')
        .selectAll('tr').style("background-color", (d, i) => {
          if (index === i) {
            return "LightSkyBlue";
          }
        });

      //highlight line with at index
      // console.log("table:highlight line with at index\n");

    }
  }

  parseFunctionReturn(msg) {

  }

  resize() {

  }
}
