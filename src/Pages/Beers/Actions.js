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
                },
                mdl.props.map((prop, key) =>
                  m("option", { key, value: prop.value }, prop.key)
                )
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
            mdl.state.view == "charts" && [
              m(
                "ul.action-radios",
                mdl.props.map((prop, key) =>
                  m(".", [
                    m("input[type=radio].charts-radio", {
                      key,
                      name: prop.value,
                      value: prop.value,
                      id: prop.value,
                      checked: prop.checked,
                      onclick: () => (prop.checked = !prop.checked),
                    }),
                    m("label.radio-label", { key, for: prop.value }, prop.key),
                  ])
                )
              ),
            ],
          ]
    ),
}

export default Actions
