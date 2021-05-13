import { createSlice } from '@reduxjs/toolkit'
import { getHashParams } from 'utils/hashParams'
import * as persistence from 'utils/persistence'

const hashData = getHashParams()

export const holdListSlice = createSlice({
  name: 'watchList',
  initialState: {
    listHold: hashData.listHold || persistence.get('binance_listHold') || [],
  },
  reducers: {
    addHoldItem: (state, action) => {
      const newHold = action.payload
      state.listHold.push(newHold)
      persistence.set('binance_listHold', state.listHold)
    },
    deleteHoldItem: (state, action) => {
      const { pair } = action.payload
      const deleteIndexListData = state.listHold.find(e => e.pair === pair)
      state.listHold.splice(deleteIndexListData, 1)
      persistence.set('binance_listHold', state.listHold)
    }
  }
})

export const { addHoldItem, deleteHoldItem } = holdListSlice.actions

export const selectListHold = state => state.holdList.listHold

export default holdListSlice.reducer
