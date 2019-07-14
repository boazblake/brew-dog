import m from "mithril"
import Actions from "./Actions.js"
import Charts from "./Charts.js"
import BarChart from "./BarChart.js"
import Cards from "./Cards.js"

import { getBeers } from "./model.js"
import { sortBy, prop, props, map } from "ramda"

const onError = mdl => ({ response }) => {
  mdl.state.errors = map(props(["param", "msg"]), response.data)
  mdl.state.data = undefined
}

const onSuccess = mdl => data => {
  mdl.state.errors = undefined
  mdl.state.data = data
}

const Beers = ({ attrs: { mdl } }) => {
  const load = () =>
    getBeers(mdl)(mdl.pagination).then(onSuccess(mdl), onError(mdl))

  return {
    oninit: load,
    view: ({ attrs: { mdl } }) => {
      if (mdl.state.data) {
        const sortedByProp = sortBy(prop(mdl.comparison.selectionsBy))
        return [
          m(Actions, { mdl, load }),
          mdl.state.view == "cards"
            ? m(Cards, { mdl, sortedByProp })
            : mdl.state.view == "bar"
            ? m(BarChart, { mdl, sortedByProp })
            : m(Charts, { mdl, sortedByProp }),
        ]
      }
    },
  }
}

export default Beers
