import m from "mithril"

// const toAbvTrace = dto => {
//   x: [],
//   y: [],
//   type: 'scatter'
// }
// const toIbuTrace = dto => {
//   x: [],
//   y: [],
//   type: 'scatter'
// }
// const topHTrace = dto => {
//   x: [],
//   y: [],
//   type: 'scatter'
// }
// const toSrmTrace = dto => {
//   x: [],
//   y: [],
//   type: 'scatter'
// }

const toScatterTrace = dto => dto

const format = (data, type) => {
  console.log(data, type)
  switch (type) {
    case "scatter":
      return toScatterTrace(data)
      break
  }
}

const Charts = () => {
  const toPlot = (dom, data, type) => {
    return Plotly.newPlot(dom, format(data, type), {
      title: `Brew Dog`,
    })
  }

  return {
    onupdate: ({ dom, attrs: { mdl, sortedByProp } }) =>
      toPlot(dom, sortedByProp(mdl.state.data), mdl.state.view),
    oncreate: ({ dom, attrs: { mdl, sortedByProp } }) =>
      toPlot(dom, sortedByProp(mdl.state.data), mdl.state.view),
    view: () => {
      return m(".chart", { id: "chart" })
    },
  }
}

export default Charts
