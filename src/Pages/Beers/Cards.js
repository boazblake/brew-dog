import m from "mithril"
import BeerProfile from "../../Components/BeerProfile.js"
import BeerCard from "./BeerCard.js"
import { head, propEq } from "ramda"

const parseIds = (ids) => Object.keys(ids).map((id) => parseInt(id))

const byComparison = (ids) => (beer) => parseIds(ids).includes(beer.id)

const CompareBeers = {
  view: ({ attrs: { mdl, beers } }) =>
    m(
      ".container.compare-beers",
      beers.map((beer) => m(BeerProfile, { mdl, beer, key: beer.id }))
    )
}

const BeerList = {
  view: ({ attrs: { mdl, beers } }) =>
    m(
      ".cards.container",
      beers.map(({ name, abv, ibu, ph, srm, image_url, id }) =>
        m(BeerCard, { mdl, name, abv, ibu, ph, srm, img: image_url, key: id })
      )
    )
}

const Cards = ({ attrs: { mdl } }) => {
  return {
    view: ({ attrs: { mdl, sortedByProp } }) => [
      [
        mdl.comparison.modal &&
          m(
            ".compare-beers.modal",
            m(BeerProfile, {
              beer: head(
                mdl.state.data.beers.filter(propEq("id", mdl.comparison.modal))
              )
            })
          )
      ],
      mdl.comparison.selections
        ? m(CompareBeers, {
            mdl,
            beers: mdl.state.data.beers.filter(
              byComparison(mdl.comparison.beerList)
            )
          })
        : m(BeerList, {
            mdl,
            beers: sortedByProp(mdl.state.data.beers)
          })
    ]
  }
}

export default Cards
