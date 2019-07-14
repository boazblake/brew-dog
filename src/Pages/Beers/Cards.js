import m from "mithril"
import CompareBeers, { BeerProfile } from "./BeerProfiles.js"
import BeerCard from "./BeerCard.js"
import { head, propEq } from "ramda"

const parseIds = ids => Object.keys(ids).map(id => parseInt(id))

const byComparison = ids => beer => parseIds(ids).includes(beer.id)

const BeerList = {
  view: ({ attrs: { mdl, beers } }) =>
    m(
      ".container",
      beers.map(({ name, abv, ibu, ph, srm, image_url, id }) =>
        m(BeerCard, { mdl, name, abv, ibu, ph, srm, img: image_url, key: id })
      )
    ),
}

const Cards = () => {
  return {
    view: ({ attrs: { mdl, sortedByProp } }) =>
      m(".cards", [
        [
          mdl.comparison.modal &&
            m(
              ".compare-beers.modal",
              m(BeerProfile, {
                beer: head(
                  mdl.state.data.filter(propEq("id", mdl.comparison.modal))
                ),
              })
            ),
        ],
        mdl.comparison.selections
          ? m(CompareBeers, {
              mdl,
              beers: mdl.state.data.filter(
                byComparison(mdl.comparison.beerList)
              ),
            })
          : m(BeerList, {
              mdl,
              beers: sortedByProp(mdl.state.data),
            }),
      ]),
  }
}

export default Cards
