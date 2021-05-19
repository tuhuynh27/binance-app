import { createSlice } from '@reduxjs/toolkit'
import { getHashParams } from 'utils/hashParams'
import * as persistence from 'utils/persistence'

function buildInitialData(listWatch = []) {
  return listWatch.map(e => ({
    stream: `${e.toLowerCase()}usdt@aggTrade`,
    pair: e,
    price: null,
    high: null,
    low: null,
    volume: null,
    change: null,
  }))
}

const hashData = getHashParams()

export const watchListSlice = createSlice({
  name: 'watchList',
  initialState: {
    listWatch: hashData.listWatch || persistence.get('binance_listWatch') || ['BTC', 'ETH'],
    tableData: buildInitialData(hashData.listWatch || persistence.get('binance_listWatch') || ['BTC', 'ETH'])
  },
  reducers: {
    addWatchItem: (state, action) => {
      const newPair = action.payload
      if (!state.listWatch.includes(newPair)) {
        state.listWatch.push(newPair)
        const newItem = {
          stream: `${newPair.toLowerCase()}usdt@aggTrade`,
          pair: newPair,
          price: null,
          high: null,
          low: null,
          volume: null,
          change: null,
        }
        state.tableData.push(newItem)
        persistence.set('binance_listWatch', state.listWatch)
      }
    },
    setWatchItems: (state, action) => {
      const listWatch = action.payload
      state.listWatch = listWatch
      state.tableData = state.tableData.filter(e => listWatch.includes(e.pair))
      persistence.set('binance_listWatch', state.listWatch)
    },
    updateTableData: (state, action) => {
      const { stream, price } = action.payload
      const existedItem = state.tableData.find(e => e.stream === stream)
      if (!existedItem) {
        const newItem = {
          stream,
          pair: stream.slice(0, -13).toUpperCase(),
          price,
          high: null,
          low: null,
          volume: null,
          change: null,
        }
        state.tableData.push(newItem)
      } else {
        existedItem.price = price
      }
    },
    updateMetadata: (state, action) => {
      const { stream, highPrice, lowPrice, volume, change } = action.payload
      const existedItem = state.tableData.find(e => e.stream === stream)
      if (!existedItem) return
      existedItem.high = highPrice
      existedItem.low = lowPrice
      existedItem.volume = volume
      existedItem.change = change
    },
    removeWatchItem: (state, action) => {
      const { pair } = action.payload
      const deleteIndexTableData = state.tableData.findIndex(e => e.pair === pair)
      state.tableData.splice(deleteIndexTableData, 1)
      const deleteIndexListData = state.listWatch.findIndex(e => e === pair)
      state.listWatch.splice(deleteIndexListData, 1)
      persistence.set('binance_listWatch', state.listWatch)
    },
  }
})

export const { addWatchItem, setWatchItems, updateTableData, updateMetadata, removeWatchItem } = watchListSlice.actions

export const selectTableData = state => state.watchList.tableData
export const selectListWatch = state => state.watchList.listWatch

export default watchListSlice.reducer
