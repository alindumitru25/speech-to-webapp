import * as d3 from "d3";

let data = [];
let width = 3200;
let height = 100;
let xmin = 0;
let xmax = 4;
let ymin = -1;
let ymax = 1;
let xScale = d3.scaleLinear();
let yScale = d3.scaleLinear();
let node = document.createElement("div");
let node2 = document.createElement("div");
let vis = d3.select(node).append("svg:svg");
let vis2 = d3.select(node).append("svg:svg");
let graph = vis.append("svg:g");
let graph2 = vis2.append("svg:g");
let path = graph.append("svg:path");
let path2 = graph2.append("svg:path");
let sine = d3.line();
let inversesine = d3.line();
let time = 0;
let time2 = 0;
let i;
for (i = 0; i < 150; i++) {
  data.push((i * 10) / 250);
}
xScale.domain([xmin, xmax]).range([0, width]);
yScale.domain([ymin, ymax]).range([0, height]);
vis.attr("class", "trig").attr("width", width).attr("height", height);
vis2.attr("class", "trig").attr("width", width).attr("height", height);
sine
  .x(function (d, i) {
    return xScale(d);
  })
  .y(function (d, i) {
    return yScale(Math.cos(6 * (d + time)) * Math.cos(5 * (d + time)));
  });
inversesine
  .x(function (d, i) {
    return xScale(d);
  })
  .y(function (d, i) {
    return yScale(Math.sin(6 * (d - time2)) * -Math.sin(5 * (d - time2)));
  });

const defaultTimer1Value = 0.01;
const defaultTimer2Value = 0.012;
let timer1ValueIncrease = defaultTimer1Value;
let timer2ValueIncrease = defaultTimer2Value;
function draw() {
  path.attr("d", sine(data));
  path2.attr("d", inversesine(data));
  time += timer1ValueIncrease;
  time2 += timer2ValueIncrease;
}

const settimer1ValueIncrease = (newValue) => {
  timer1ValueIncrease = newValue;
};

const settimer2ValueIncrease = (newValue) => {
  timer2ValueIncrease = newValue;
};

export {
  draw,
  node,
  node2,
  vis,
  vis2,
  settimer1ValueIncrease,
  settimer2ValueIncrease,
  defaultTimer1Value,
  defaultTimer2Value,
};
