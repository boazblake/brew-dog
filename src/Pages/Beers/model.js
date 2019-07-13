import { compose, filter, map, pluck, prop, props, test } from "ramda"

const getBeers = mdl => params => mdl.http(mdl.url(), params)

const srmScale = {
  2: "",
  3: "",
  4: "",
  6: "",
  9: "",
  12: "",
  15: "",
  18: "",
  20: "",
  24: "",
  30: "",
  40: "",
}

export { getBeers }
