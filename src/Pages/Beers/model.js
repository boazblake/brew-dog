import { compose, filter, map, pluck, prop, props, test } from "ramda"

const getBeers = mdl => params => mdl.http(mdl.url(), params)

export { getBeers }
