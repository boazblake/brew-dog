import m from "mithril"
import { compose, filter, view, lensIndex, propEq, props, map } from "ramda"

const toTrace = (prop, data, mode) => ({
  x: data.map(view(lensIndex(1))),
  y: data.map(view(lensIndex(0))),
  mode,
  name: prop[2],
  line: { color: prop[1], width: 2 },
  marker: { color: prop[1], size: 12 },
})

const getTraceProps = compose(
  map(props(["value", "color", "key"])),
  filter(propEq("checked", true))
)

const getData = (prop, data) => map(props([prop[0], "name"]), data)

const makeDto = (data, props) => {
  let mode = "lines+markers"
  const traces = props.map(prop => toTrace(prop, getData(prop, data), mode))
  console.log("traces", traces)
  return traces
}

const Charts = () => {
  const toPlot = (dom, data, props) => {
    return Plotly.newPlot(dom, makeDto(data, getTraceProps(props)), {
      title: `Brew Dog`,
    })
  }

  return {
    oncreate: ({ dom, attrs: { mdl, data } }) => toPlot(dom, data, mdl.props),
    onupdate: ({ dom, attrs: { mdl, data } }) => toPlot(dom, data, mdl.props),
    view: ({ attrs: { mdl } }) => [
      m(".chart", { id: "chart" }),
      // ("code", ("pre", JSON.stringify(mdl.comparison.filterBy))),
    ],
  }
}

export default Charts
