import m from "mithril"
import { map } from "ramda"

const toAbvTrace = (dto, type) => ({
  x: x.push(dto.abv),
  y: y.push(dto.name),
  type,
})
const toIbuTrace = (dto, type) => ({
  x: x.push(dto.ibu),
  y: y.push(dto.name),
  type,
})
const topHTrace = (dto, type) => ({
  x: x.push(dto.ph),
  y: y.push(dto.name),
  type,
})
const toSrmTrace = (dto, type) => ({
  x: x.push(dto.srm),
  y: y.push(dto.name),
  type,
})
const traces = [toAbvTrace, toIbuTrace, topHTrace, toSrmTrace]

const toTraces = data => {
  let type = "scatter"
  console.log(
    "format"
    // data.map(dto => )
  )
  return data
}

const Charts = () => {
  const toPlot = (dom, data) => {
    return Plotly.newPlot(dom, [toTraces(data)], {
      title: `Brew Dog`,
    })
  }

  return {
    oncreate: ({ dom, attrs: { mdl, data } }) => toPlot(dom, data),
    view: ({ attrs: { mdl } }) => [
      m(".chart", { id: "chart" }),
      // ("code", ("pre", JSON.stringify(mdl.comparison.filterBy))),
    ],
  }
}

export default Charts
