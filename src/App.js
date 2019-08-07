import m from "mithril"
import Beers from "./Pages/Beers/index.js"
import Beer from "./Pages/Beer/index.js"

const Errors = ({ attrs: { mdl } }) => {
  return {
    view: () =>
      mdl.state.errors.map((err, key) => m("code.error", { key }, err))
  }
}

const Header = {
  view: ({ attrs: { mdl } }) =>
    (mdl.comparison.selections || mdl.state.current.beer) &&
    m("header.container.actions", [
      m(
        "button.btn",
        {
          onclick: () => {
            mdl.comparison.beerList = {}
            mdl.comparison.selections = false
            m.route.set("/beers")
          }
        },
        "Back to List"
      )
    ])
}

const Body = {
  view: ({ attrs: { mdl }, children }) => [
    children,
    mdl.state.errors && m(Errors, { mdl })
  ]
}

const Layout = {
  view: ({ children, attrs: { mdl } }) =>
    m(".app", [m(Header, { mdl }), m(Body, { mdl }, children)])
}

const App = (mdl) => {
  return {
    "/beers": {
      render: () => m(Layout, { mdl }, m(Beers, { mdl }))
    },
    "/beer/:name": {
      onmatch: ({ name }) => {
        mdl.state.current.id
          ? (mdl.state.current.beer = name)
          : m.route.set("/beers")
      },
      render: () => m(Layout, { mdl }, m(Beer, { mdl }))
    }
  }
}

export default App
