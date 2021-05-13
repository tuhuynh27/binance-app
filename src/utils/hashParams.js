export function getHashParams() {
  const query = getQueryParams(document.location.hash)
  if (!query || Object.keys(query).length === 0) return { listWatch: null, listHold: null }
  return JSON.parse(query['#data'])
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
