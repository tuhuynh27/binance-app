import { createSlice } from '@reduxjs/toolkit'
import { getHashParams } from 'utils/hashParams'
import * as persistence from 'utils/persistence'

function buildInitialData(listWatch = []) {
  return listWatch.map(e => ({
    stream: `${e.toLowerCase()}usdt@aggTrade`,
    pair: e,
    price: 0
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
      state.listWatch.push(newPair)
      persistence.set('binance_listWatch', state.listWatch)
    },
    updateTableData: (state, action) => {
      const { stream, price } = action.payload
      const existedItem = state.tableData.find(e => e.stream === stream)
      if (!existedItem) {
        const newItem = {
          stream,
          pair: stream.slice(0, -13).toUpperCase(),
          price
        }
        state.tableData.push(newItem)
      } else {
        existedItem.price = price
      }
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

export const { addWatchItem, updateTableData, removeWatchItem } = watchListSlice.actions

export const selectTableData = state => state.watchList.tableData
export const selectListWatch = state => state.watchList.listWatch

export default watchListSlice.reducer
