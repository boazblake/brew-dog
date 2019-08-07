import m from "mithril"
import BeerProfile from "../../Components/BeerProfile.js"

const Beer = ({ attrs: { mdl } }) => {
  const load = () =>
    mdl.http(mdl.url(mdl.state.current.id)).then((data) => {
      mdl.onSuccess(mdl, "beer")(data)
      console.log(mdl.state.data.beer[0])
    }, mdl.onError(mdl, "beer"))

  return {
    oninit: load,
    view: ({ attrs: { mdl } }) => {
      return (
        mdl.state.data.beer &&
        m(".beer-container", [
          m(BeerProfile, {
            mdl,
            beer: mdl.state.data.beer[0],
            key: mdl.state.current.id
          })
        ])
      )
    },
    onremove: () => {
      mdl.state.current.beer = undefined
      mdl.state.data.beer = undefined
      mdl.state.current.id = undefined
    }
  }
}

export default Beer
