import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { currentStroke } from "./modules/currentStroke/slice"
import { modalVisible } from "./modules/modals/slice"
import { projectsList } from "./modules/projectsList/slice"
import historyIndex from "./modules/historyIndex/slice"
import strokes from "./modules/strokes/slice"
import logger from "redux-logger"
import { RootState } from "./utils/types"

export const store = configureStore({
  reducer: {
    historyIndex,
    strokes,
    currentStroke,
    modalVisible,
    projectsList
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger)
})

export type AppThunk = ThunkAction<
  void,
  RootState,
  unknown,
  Action<string>
>
