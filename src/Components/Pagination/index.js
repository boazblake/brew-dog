import m from "mithril"

const Pagination = ({ attrs: { mdl, load } }) => {
  const format = (state) => {
    if (state.per_page <= 0) return (state.per_page = 1)
    if (state.per_page >= 81) return (state.per_page = 80)
  }

  const pageBack = (mdl) => {
    mdl.pagination.page == 1 ? mdl.pagination.page : mdl.pagination.page--
    load()
  }

  const pageForward = (mdl) => {
    mdl.state.data.length == 0 ? mdl.pagination.page : mdl.pagination.page++
    load()
  }

  return {
    view: ({ attrs: { mdl } }) =>
      m(".pagination", [
        m(
          "button.btn",
          { disabled: mdl.pagination.page == 1, onclick: () => pageBack(mdl) },
          "Prev"
        ),
        m("input.input[type=number]", {
          value: mdl.pagination.per_page,
          min: 1,
          max: 80,
          onblur: () => format(mdl.pagination),
          onchange: (e) => {
            mdl.pagination.per_page = e.target.value
            format(mdl.pagination)
            load()
          }
        }),
        m(
          "button.btn",
          {
            disabled: mdl.state.data.length == 0,
            onclick: () => pageForward(mdl)
          },
          "Next"
        )
      ])
  }
}

export default Pagination
