import m from "mithril"
import Stream from "mithril-stream"
import { sortBy, prop, props, map } from "ramda"

const log = (m) => (v) => {
  console.log(m, v)
  return v
}

const url = (id = "") => `https://api.punkapi.com/v2/beers/${id}`

const beerProps = [
  { color: "#1abc9c", key: "pH", value: "ph" },
  { color: "#3498db", key: "Alcohol By Vol", value: "abv" },
  { color: "#9b59b6", key: "Int. Bitterness Levels", value: "ibu" },
  { color: "#34495e", key: "Standard Reference Method", value: "srm" },
  { color: "#f1c40f", key: "Target Final Gravity", value: "target_fg" },
  { color: "##2ecc71", key: "Target Original Gravity", value: "target_og" },
  { color: "#c0392b", key: "European Brewery Convention", value: "ebc" },
  { color: "#7f8c8d", key: "Attenuation Level", value: "attenuation_level" }
]

const onError = (mdl, page) => ({ response }) => {
  mdl.state.errors = map(props(["param", "msg"]), response.data)
  mdl.state.data[page] = undefined
}

const onSuccess = (mdl, page) => (data) => {
  mdl.state.errors = undefined
  mdl.state.data[page] = data
}

const pagination = {
  page: 1,
  per_page: 30
}

const comparison = {
  beerList: {},
  selections: false,
  sortBy: "abv",
  modal: undefined
}

const state = {
  profile: "",
  isLoading: false,
  loadingProgress: {
    max: 0,
    value: 0
  },
  data: {},
  errors: undefined,
  view: "cards",
  current: {
    beer: undefined,
    id: undefined
  }
}

function onProgress(e) {
  if (e.lengthComputable) {
    model.state.loadingProgress.max = e.total
    model.state.loadingProgress.value = e.loaded
    m.redraw()
  }
}

function onLoad() {
  return false
}

function onLoadStart() {
  model.state.isLoading = true
  return false
}
function onLoadEnd() {
  model.state.isLoading = false
  model.state.loadingProgress.max = 0
  model.state.loadingProgress.value = 0
  return false
}

const xhrProgress = {
  config: (xhr) => {
    console.log(xhr)
    xhr.onprogress = onProgress
    xhr.onload = onLoad
    xhr.onloadstart = onLoadStart
    xhr.onloadend = onLoadEnd
  }
}

const http = (url, params) =>
  m.request(Object.assign({ url, params, ...{ xhrProgress } }))

const Model = {
  http,
  log,
  url,
  state,
  pagination,
  comparison,
  props: beerProps,
  onSuccess,
  onError
}

export default Model
