import m from "mithril"

import Pagination from "../../Components/Pagination/index.js"

const Actions = {
  view: ({ attrs: { mdl, load } }) =>
    m(
      "header.container.actions",
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
            mdl.state.view == "cards" && [
              m(
                "button.btn",
                {
                  disabled: !Object.values(mdl.comparison.beerList).includes(
                    true
                  ),
                  onclick: () => (mdl.comparison.selections = true),
                },
                "Compare Selected"
              ),
              m(
                "select.select",
                {
                  onchange: e => (mdl.comparison.sortBy = e.target.value),
                  value: mdl.comparison.sortBy,
                  multiple: mdl.state.view == "line",
                },
                [
                  m("option.option", { value: "abv" }, "abv"),
                  m("option.option", { value: "ibu" }, "ibu"),
                  m("option.option", { value: "ph" }, "pH"),
                  m("option.option", { value: "srm" }, "srm"),
                ]
              ),
            ],
            m(Pagination, { mdl, load }),
            m(
              "select.select",
              {
                onchange: e => (mdl.state.view = e.target.value),
                value: mdl.state.view,
              },
              [
                m("option.option", { value: "cards" }, "Card View"),
                m("option.option", { value: "charts" }, "Charts View"),
              ]
            ),
          ]
    ),
}

export default Actions
