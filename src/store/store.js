import { configureStore } from '@reduxjs/toolkit'

import watchListReducer from 'views/Index/WatchTable/watchListSlice'
import holdListReducer from 'views/Index/HoldTable/holdListSlice'

export default configureStore({
  reducer: {
    watchList: watchListReducer,
    holdList: holdListReducer
  }
})
