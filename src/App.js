import m from "mithril"
import { getBeers, filterBy } from "./helpers.js"

const Errors = ({ attrs: { mdl } }) => {
  let err = mdl.state.errors.message
  return {
    view: () => m("code.error", err),
  }
}

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

const Beer = ({ attrs: { name, img } }) => {
  console.log(name, img)

  return {
    view: ({ attrs: { name, img } }) => m(".beer", [m("img", { src: img })]),
  }
}

const BeerList = ({ attrs: { mdl } }) => {
  const onError = errors => {
    mdl.state.errors = errors
    mdl.state.data = undefined
  }

  const onSuccess = data => {
    mdl.state.errors = undefined
    mdl.state.data = data
  }

  return {
    oninit: ({ attrs: { mdl } }) => getBeers(mdl).then(onSuccess, onError),
    view: ({ attrs: { mdl } }) =>
      m(
        ".beer-list",
        mdl.state.data &&
          mdl.state.data.map(([name, img]) => m(Beer, { name, img })),
        mdl.state.errors && m(Errors, { mdl })
      ),
  }
}

export const routes = mdl => {
  return {
    "/beers": {
      render: () => m(BeerList, { mdl }),
    },
  }
}
