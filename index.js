import m from "mithril"

import Model from "./src/model.js"
import App from "./src/App.js"

if (module.hot) {
  module.hot.accept()
}

if (process.env.NODE_ENV !== "production") {
  console.log("Looks like we are in development mode!")
}

function getProfile(w) {
  if (w < 668) return "phone"
  if (w < 920) return "tablet"
  return "desktop"
}

// Styles
import "./index.scss"

let winW = window.innerWidth
Model.state.profile = getProfile(winW)

function checkWidth() {
  const w = window.innerWidth
  if (winW !== w) {
    winW = w
    var lastProfile = Model.state.profile
    Model.state.profile = getProfile(w)
    if (lastProfile != Model.state.profile) m.redraw()
  }
  requestAnimationFrame(checkWidth)
}

checkWidth()

const root = document.body

m.route(root, "/beers", App(Model))
