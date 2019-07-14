import m from "mithril"
import Beers from "./Pages/Beers/index.js"

const Errors = ({ attrs: { mdl } }) => {
  return {
    view: () =>
      mdl.state.errors.map((err, key) => m("code.error", { key }, err)),
  }
}

const Header = {
  view: ({ attrs: { mdl } }) => m(".header", []),
}

const Body = {
  view: ({ attrs: { mdl }, children }) => [
    children,
    mdl.state.errors && m(Errors, { mdl }),
  ],
}

const Layout = {
  view: ({ children, attrs: { mdl } }) =>
    m(".app", [m(Header, { mdl }), m(Body, { mdl }, children)]),
}

const App = mdl => {
  return {
    "/beers": {
      render: () => m(Layout, { mdl }, m(Beers, { mdl })),
    },
  }
}

export default App
