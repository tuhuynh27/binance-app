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
      const index = action.payload
      state.listHold.splice(index, 1)
      persistence.set('binance_listHold', state.listHold)
    },
    setListHold: (state, action) => {
      state.listHold = action.payload
      persistence.set('binance_listHold', state.listHold)
    }
  }
})

export const { addHoldItem, deleteHoldItem, setListHold } = holdListSlice.actions

export const selectListHold = state => state.holdList.listHold

export default holdListSlice.reducer
