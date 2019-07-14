import m from "mithril"

const Beer = {
  view: ({ attrs: { beer } }) =>
    m(".group.row", [
      m("progress.cell.prog-chart", { value: beer.abv, max: 100 }),
      m("progress.cell.prog-chart", { value: beer.ibu, max: 100 }),
      m("progress.cell.prog-chart", { value: beer.ph, max: 100 }),
      m("progress.cell.prog-chart", { value: beer.srm, max: 100 }),
    ]),
}

const BarChart = {
  view: ({ attrs: { mdl, sortedByProp } }) =>
    m(
      ".charts",
      sortedByProp(mdl.state.data).map((beer, key) => m(Beer, { beer, key }))
    ),
}

export default BarChart
