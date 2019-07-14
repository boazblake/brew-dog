import m from "mithril"

const BeerProfile = {
  view: ({ attrs: { beer } }) =>
    m(".beer-profile", [
      m(".cell.row", [
        m("img.img", { id: 1, src: beer.image_url }),
        m(".cell.col", [
          m("code.cell.info", "ABV: ", beer.abv, "%"),
          m("progress.cell", { value: beer.abv, max: 100 }),
          m("code.cell.info", "IBU: ", beer.ibu),
          m("progress.cell", { value: beer.ibu, max: 100 }),
          m("code.cell.info", "pH: ", beer.ph),
          m("progress.cell", { value: beer.ph, max: 100 }),
          m("code.cell.info", "SRM: ", beer.srm),
          m("progress.cell", { value: beer.srm, max: 100 }),
        ]),
      ]),
      m(".cell", m("span.name", beer.name)),
      m(".cell.tagline", beer.tagline),
    ]),
}

const CompareBeers = {
  view: ({ attrs: { mdl, beers } }) =>
    m(
      ".container.compare-beers",
      beers.map(beer => m(BeerProfile, { mdl, beer, key: beer.id }))
    ),
}

export default CompareBeers
