import m from "mithril"

const Beer = {
  view: ({ attrs: { beer } }) =>
    m(".container", [m("img.img-beer", { src: beer.image_url })]),
}

export default Beer
