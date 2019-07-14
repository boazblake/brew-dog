import m from "mithril"

const Pagination = ({ attrs: { mdl, load } }) => {
  const pageBack = mdl => {
    mdl.pagination.page == 1 ? mdl.pagination.page : mdl.pagination.page--
    load()
  }

  const pageForward = mdl => {
    mdl.state.data.length == 0 ? mdl.pagination.page : mdl.pagination.page++
    load()
  }

  return {
    view: ({ attrs: { mdl } }) => [
      m(
        "button.btn",
        { disabled: mdl.pagination.page == 1, onclick: () => pageBack(mdl) },
        "Prev"
      ),
      m("input.input[type=number]", {
        value: mdl.pagination.per_page,
        min: 0,
        max: 80,
        onchange: e => (mdl.pagination.per_page = e.target.value),
      }),
      m(
        "button.btn",
        {
          disabled: mdl.state.data.length == 0,
          onclick: () => pageForward(mdl),
        },
        "Next"
      ),
    ],
  }
}

export default Pagination
