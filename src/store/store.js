import { configureStore } from '@reduxjs/toolkit'

import watchListReducer from 'views/index/watchListSlice'
import holdListReducer from 'views/index/holdListSlice'

export default configureStore({
  reducer: {
    watchList: watchListReducer,
    holdList: holdListReducer
  }
})
