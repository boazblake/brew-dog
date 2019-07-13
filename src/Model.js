import m from "mithril"
import Stream from "mithril-stream"

const log = m => v => {
  console.log(m, v)
  return v
}

const url = (id = "") => `https://api.punkapi.com/v2/beers/${id}`

const pagination = {
  page: 1,
  per_page: 30,
}

const comparisonBeerList = {}
const compareSelections = false

const state = {
  profile: "",
  isLoading: false,
  loadingProgress: {
    max: 0,
    value: 0,
  },
  data: undefined,
  errors: undefined,
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
  config: xhr => {
    console.log(xhr)
    xhr.onprogress = onProgress
    xhr.onload = onLoad
    xhr.onloadstart = onLoadStart
    xhr.onloadend = onLoadEnd
  },
}

const http = (url, params) => m.request({ url, params, ...{ xhrProgress } })

const Model = {
  http,
  log,
  url,
  state,
  pagination,
  comparisonBeerList,
  compareSelections,
  auth: false,
}

export default Model
