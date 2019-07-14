import m from "mithril"

import Pagination from "../../Components/Pagination/index.js"

const Actions = {
  view: ({ attrs: { mdl, load } }) =>
    mdl.comparison.selections
      ? m(
          "button.btn",
          {
            onclick: () => {
              mdl.comparison.beerList = {}
              mdl.comparison.selections = false
            },
          },
          "Back to List"
        )
      : [
          m(
            "button.btn",
            {
              disabled: !Object.values(mdl.comparison.beerList).includes(true),
              onclick: () => (mdl.comparison.selections = true),
            },
            "Compare Selected"
          ),
          m(
            "select.select",
            {
              onchange: e => (mdl.comparison.selectionsBy = e.target.value),
              value: mdl.comparison.selectionsBy,
            },
            [
              m("option.option", { value: "abv" }, "abv"),
              m("option.option", { value: "ibu" }, "ibu"),
              m("option.option", { value: "ph" }, "pH"),
              m("option.option", { value: "srm" }, "srm"),
            ]
          ),
          m(Pagination, { mdl, load }),
          m(
            "select.select",
            {
              onchange: e => (mdl.state.view = e.target.value),
              value: mdl.state.view,
            },
            [
              m("option.option", { value: "cards" }, "Card View"),
              m("option.option", { value: "line" }, "Line Chart"),
              m("option.option", { value: "bar" }, "Bar Chart"),
            ]
          ),
        ],
}

export default Actions
