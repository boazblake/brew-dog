import m from "mithril"

const MiniBeer = () => {
  return {
    view: ({ attrs: { mdl, abv, ibu, ph, srm, img, key } }) => {
      return m(".mini-beer", [
        [
          m("input[type=checkbox]", {
            id: `checkbox-${key}`,
            name: `checkbox-${key}`,
            onclick: () =>
              (mdl.comparisonBeerList[key] = !mdl.comparisonBeerList[key]),
            checked: mdl.comparisonBeerList[key],
          }),
          m(
            "label.label",
            { for: `checkbox-${key}` },
            m("img.img", { src: img })
          ),
          m(".footer", [
            m("cell.row", [
              m("code.cell.info", "ABV: ", abv, "%"),
              m("code.cell.info", "IBU: ", ibu),
            ]),
            m("cell.row", [
              m("code.cell.info", "pH: ", ph),
              m("code.cell.info", "SRM: ", srm),
            ]),
          ]),
        ],
        ,
      ])
    },
  }
}

const BeerList = {
  view: ({ attrs: { mdl, beers } }) =>
    m(
      ".container",
      beers.map(({ abv, ibu, ph, srm, image_url, id }) =>
        m(MiniBeer, { mdl, abv, ibu, ph, srm, img: image_url, key: id })
      )
    ),
}

export default BeerList
