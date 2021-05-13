export function getHashParams() {
  const queryObj = getQueryParams(document.location.hash)
  if (!queryObj || Object.keys(queryObj).length === 0) return { listWatch: null, listHold: null }
  const query = atob(queryObj['#data'])
  return JSON.parse(query)
}

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');
  let params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

export function makeHashParams(obj) {
  const shareStr = JSON.stringify(obj)
  const shareStrEncoded = btoa(shareStr)
  return `${window.location.origin}/#data=${shareStrEncoded}`
}
