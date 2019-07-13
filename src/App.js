import m from "mithril"
import Beers from "./Pages/Beers/index.js"

const Errors = ({ attrs: { mdl } }) => {
  let err = mdl.state.errors.message
  return {
    view: () => m("code.error", err),
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
    // "/": {
    //   onmatch: (a, b, c) =>
    //     mdl.auth ? m.route.set("/beers") : m.route.set("/nonbeers"),
    // },
    "/beers": {
      render: () => m(Layout, { mdl }, m(Beers, { mdl })),
    },
    // "/nonbeers": {
    //   render: () => m(Layout, { mdl }, m(Beers, { mdl })),
    // },
    // "/:404": m(Layout, { mdl }, m(Errors, { mdl })),
  }
}

export default App
