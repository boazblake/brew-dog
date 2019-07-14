import m from "mithril"

const BeerCard = () => {
  let showInfo = true
  return {
    view: ({ attrs: { name, mdl, abv, ibu, ph, srm, img, key } }) => {
      return m(
        ".beer-card",
        {
          onmouseover: e => (showInfo = false),
          onmouseout: e => (showInfo = true),
        },
        [
          [
            m("input[type=checkbox]", {
              id: `checkbox-${key}`,
              name: `checkbox-${key}`,
              onclick: () =>
                (mdl.comparison.beerList[key] = !mdl.comparison.beerList[key]),
              checked: mdl.comparison.beerList[key],
            }),
            m(
              "label.label",
              { for: `checkbox-${key}` },
              m("img.img", { src: img })
            ),
            m(
              ".footer",
              showInfo
                ? [
                    m("cell.row", [
                      m("code.cell.info", "ABV: ", abv, "%"),
                      m("code.cell.info", "IBU: ", ibu),
                    ]),
                    m("cell.row", [
                      m("code.cell.info", "pH: ", ph),
                      m("code.cell.info", "SRM: ", srm),
                    ]),
                  ]
                : name
            ),
          ],
          ,
        ]
      )
    },
  }
}

export default BeerCard
