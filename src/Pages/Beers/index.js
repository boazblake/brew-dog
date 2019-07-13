import m from "mithril"
import BeerList from "./BeerList.js"
import CompareBeers from "./CompareBeers.js"
import { getBeers, filterBy } from "./model.js"
import { head, sortBy, prop, propEq, isEmpty } from "ramda"

const Actions = {
  view: ({ attrs: { mdl } }) =>
    mdl.compareSelections
      ? m(
          "button.btn",
          {
            onclick: () => {
              mdl.comparisonBeerList = {}
              mdl.compareSelections = false
            },
          },
          "Back to List"
        )
      : [
          m(
            "button.btn",
            {
              disabled: !Object.values(mdl.comparisonBeerList).includes(true),
              onclick: () => (mdl.compareSelections = true),
            },
            "Compare Selected"
          ),
          m(
            "select.select",
            {
              onchange: e => (mdl.compareSelectionsBy = e.target.value),
              value: mdl.compareSelectionsBy,
            },
            [
              m("option.option", { value: "abv" }, "abv"),
              m("option.option", { value: "ibu" }, "ibu"),
              m("option.option", { value: "ph" }, "pH"),
              m("option.option", { value: "srm" }, "srm"),
            ]
          ),
        ],
}

const onError = mdl => errors => {
  mdl.state.errors = errors
  mdl.state.data = undefined
}

const onSuccess = mdl => data => {
  mdl.state.errors = undefined
  mdl.state.data = data
}

const parseIds = ids => Object.keys(ids).map(id => parseInt(id))

const byComparison = ids => beer => parseIds(ids).includes(beer.id)

const Beers = ({ attrs: { mdl } }) => {
  getBeers(mdl)(mdl.pagination).then(onSuccess(mdl), onError(mdl))

  return {
    view: ({ attrs: { mdl } }) => {
      if (mdl.state.data) {
        const sortedByProp = sortBy(prop(mdl.compareSelectionsBy))
        return [
          m(Actions, { mdl }),
          m(".beers", [
            mdl.compareSelections
              ? m(CompareBeers, {
                  mdl,
                  beers: mdl.state.data.filter(
                    byComparison(mdl.comparisonBeerList)
                  ),
                })
              : m(BeerList, {
                  mdl,
                  beers: sortedByProp(mdl.state.data),
                }),
          ]),
        ]
      }
    },
  }
}

export default Beers

// const Chart = () => {
//   const toPlot = (dom, mdl) =>
//     Plotly.newPlot(dom, mdl.state.data, {
//       title: mdl.state.symbol,
//     })

//   return {
//     oncreate: ({ dom, attrs: { mdl } }) => toPlot(dom, mdl),
//     view: () => m(".chart", { id: "chart" }),
//   }
// }
