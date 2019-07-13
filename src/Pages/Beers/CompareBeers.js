import m from "mithril"

const BeerProfile = {
  view: ({ attrs: { beer } }) =>
    m(".beer-profile", [
      m(".cell.row", [
        m("img.img", { id: 1, src: beer.image_url }),
        m(".cell.col", [
          m("code.cell.info", "ABV: ", beer.abv, "%"),
          m("code.cell.info", "IBU: ", beer.ibu),
          m("code.cell.info", "pH: ", beer.ph),
          m("code.cell.info", "SRM: ", beer.srm),
        ]),
      ]),
      m(".cell", beer.name),
      m(".cell", beer.first_brewed),
      m(".cell", beer.tagline),
      m(
        "ul.cell",
        beer.food_pairing.map((food, key) => [
          m("hr", { key }),
          m("i", { key }, food),
        ])
      ),
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
