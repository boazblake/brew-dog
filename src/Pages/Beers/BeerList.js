import m from "mithril"

const MiniBeer = () => {
  return {
    view: ({ attrs: { mdl, name, img, key } }) => {
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
      beers.map(({ name, image_url, id }) =>
        m(MiniBeer, { mdl, name, img: image_url, key: id })
      )
    ),
}

export default BeerList
