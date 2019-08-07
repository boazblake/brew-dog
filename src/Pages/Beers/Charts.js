import m from "mithril"
import { compose, filter, view, lensIndex, propEq, props, map } from "ramda"

const toLineTrace = (prop, data) => ({
  x: data.map(view(lensIndex(1))),
  y: data.map(view(lensIndex(0))),
  mode: "lines+markers",
  name: prop[2],
  line: { color: prop[1], width: 2 },
  marker: { color: prop[1], size: 12 }
})

const getTraceProps = compose(
  map(props(["value", "color", "key"])),
  filter(propEq("checked", true))
)

const getData = (prop, data) => map(props([prop[0], "name"]), data)

const makeData = (data, props) =>
  props.map((prop) => toLineTrace(prop, getData(prop, data)))

const Charts = () => {
  const toPlot = (dom, data, props) => {
    dom.style.width = window.innerWidth * 0.8
    return Plotly.newPlot(dom, makeData(data, getTraceProps(props)), {
      title: `Brew Dog`
    })
  }

  return {
    oncreate: ({ dom, attrs: { mdl, data } }) => toPlot(dom, data, mdl.props),
    onupdate: ({ dom, attrs: { mdl, data } }) => toPlot(dom, data, mdl.props),
    view: ({ attrs: { mdl } }) => [m(".chart", { id: "chart" })]
  }
}

export default Charts
