import m from "mithril"

const dasher = str => str.replace(/\s/g, "")

const BeerCard = () => {
  let showInfo = false
  return {
    view: ({ attrs: { name, mdl, abv, ibu, ph, srm, img, key } }) => {
      return m(
        ".beer-card",
        {
          onmouseover: e => (showInfo = true),
          onmouseout: e => (showInfo = false),
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
              m(".row", [
                m(
                  m.route.Link,
                  {
                    class: "link",
                    href: `/beer/${dasher(name)}`,
                    options: { params: { key } },
                  },
                  m(".info.name", name)
                ),
              ]),
              showInfo && [
                m(
                  "cell.row",
                  {
                    onmousedown: () => (mdl.comparison.modal = key),
                    onmouseup: () => (mdl.comparison.modal = undefined),
                  },
                  [
                    m("code.cell.info", "ABV: ", abv, "%"),
                    m("code.cell.info", "IBU: ", ibu),
                  ]
                ),
                m("cell.row", [
                  m("code.cell.info", "pH: ", ph),
                  m("code.cell.info", "SRM: ", srm),
                ]),
              ]
            ),
          ],
          ,
        ]
      )
    },
  }
}

export default BeerCard
