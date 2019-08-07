import m from "mithril"

const bar = () => {
  return {
    view: ({ attrs: { label, value } }) =>
      m(
        ".barchart-container",
        m(
          ".barchart-data",
          { style: { width: `${value}%` } },
          m("label.barchart-label", label)
        )
      )
  }
}

export const BeerProfile = {
  view: ({ attrs: { beer } }) => {
    return m(".beer-profile", [
      m(".cell.row", [
        m("img.img", { id: 1, src: beer.image_url }),
        m(".cell.col", [
          m(bar, { label: "ABV:", value: beer.abv }),
          m(bar, { label: "IBU:", value: beer.ibu }),
          m(bar, { label: "pH:", value: beer.ph }),
          m(bar, { label: "SRM:", value: beer.srm })
        ])
      ]),
      m(".cell", m("span.name", beer.name)),
      m(".cell.tagline", beer.tagline)
    ])
  }
}

export default BeerProfile
