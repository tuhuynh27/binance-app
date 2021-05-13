export function buildInitialData(listWatch = []) {
  return listWatch.map(e => ({
    stream: `${e.toLowerCase()}usdt@aggTrade`,
    pair: e,
    price: 0
  }))
}

export function reducer(state, action) {
  switch(action.type) {
    case 'update':
      const { stream, price } = action.payload
      const isExisted = state.find(e => e.stream === stream)
      if (!isExisted) {
        return [
          ...state,
          {
            stream,
            pair: stream.slice(0, -13).toUpperCase(),
            price
          }
        ]
      }
      return state.map(e =>{
        if (e.stream !== stream) {
          return e
        }
        return {
          ...e,
          price
        }
      })
    case 'delete':
      const { pair } = action.payload
      return state.filter(e => e.pair !== pair)
    default:
      throw new Error()
  }
}
