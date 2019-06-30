import { compose, filter, map, pluck, prop, props, test } from "ramda"

const toBeerListModel = map(props(["name", "image_url"]))

const getBeers = mdl => mdl.http(mdl.url()).then(toBeerListModel)

export { getBeers }
