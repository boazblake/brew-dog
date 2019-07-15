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
  view: ({ attrs: { mdl, filteredByProp } }) =>
    m(
      ".charts",
      filteredByProp(mdl.state.data).map(beer =>
        m(Beer, { beer, key: beer.id })
      )
    ),
}

export default BarChart
