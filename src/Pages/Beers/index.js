import m from "mithril"
import Actions from "../../Components/Actions.js"
import Charts from "./Charts.js"
import Cards from "./Cards.js"
import { getBeers } from "./model.js"
import { sortBy, prop } from "ramda"

const Beers = ({ attrs: { mdl } }) => {
  const load = () =>
    getBeers(mdl)(mdl.pagination).then(
      mdl.onSuccess(mdl, "beers"),
      mdl.onError(mdl, "beers")
    )

  return {
    oninit: load,
    view: ({ attrs: { mdl } }) => {
      if (mdl.state.data.beers) {
        const sortedByProp = sortBy(prop(mdl.comparison.sortBy))
        return [
          m(Actions, { mdl, load }),
          mdl.state.view == "cards"
            ? m(Cards, { mdl, sortedByProp })
            : m(Charts, { mdl, data: mdl.state.data.beers })
        ]
      }
    }
  }
}

export default Beers
