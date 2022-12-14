import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { strokesSelector } from "./modules/strokes/selectors"
import { historyIndexSelector } from "./modules/historyIndex/selectors"
import { FilePanel } from "./shared/FilePanel"
import { useCanvas } from "./CanvasContext"
import { ColorPanel } from "./shared/ColorPanel"
import { RootState } from "./utils/types"
import { currentStrokeSelector } from "./modules/currentStroke/selectors"
import {
  drawStroke,
  clearCanvas,
  setCanvasSize
} from "./utils/canvasUtils"
import { EditPanel } from "./shared/EditPanel"
import {
  beginStroke,
  updateStroke
} from "./modules/currentStroke/slice"
import { endStroke } from "./modules/sharedActions"
import { ModalLayer } from "./ModalLayer"

const WIDTH = 1024
const HEIGHT = 768

function App() {
  const dispatch = useDispatch()
  const canvasRef = useCanvas()
  const isDrawing = useSelector<RootState>(
    (state) => !!state.currentStroke.points.length
  )
  const historyIndex = useSelector<
    RootState,
    RootState["historyIndex"]
  >(historyIndexSelector)
  const strokes = useSelector<RootState, RootState["strokes"]>(
    strokesSelector
  )
  const currentStroke = useSelector<
    RootState,
    RootState["currentStroke"]
  >(currentStrokeSelector)
  const getCanvasWithContext = (canvas = canvasRef.current) => {
    return { canvas, context: canvas?.getContext("2d") }
  }

  const startDrawing = ({
    nativeEvent
  }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent
    dispatch(beginStroke({ x: offsetX, y: offsetY }))
  }

  useEffect(() => {
    const { context } = getCanvasWithContext()
    if (!context) {
      return
    }
    requestAnimationFrame(() =>
      drawStroke(context, currentStroke.points, currentStroke.color)
    )
  }, [currentStroke])

  const endDrawing = () => {
    if (isDrawing) {
      dispatch(endStroke({ historyIndex, stroke: currentStroke }))
    }
  }

  const draw = ({
    nativeEvent
  }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return
    }
    const { offsetX, offsetY } = nativeEvent

    dispatch(updateStroke({ x: offsetX, y: offsetY }))
  }

  useEffect(() => {
    const { canvas, context } = getCanvasWithContext()
    if (!context || !canvas) {
      return
    }
    requestAnimationFrame(() => {
      clearCanvas(canvas)

      strokes
        .slice(0, strokes.length - historyIndex)
        .forEach((stroke) => {
          drawStroke(context, stroke.points, stroke.color)
        })
    })
  }, [historyIndex, strokes])

  useEffect(() => {
    const { canvas, context } = getCanvasWithContext()
    if (!canvas || !context) {
      return
    }

    setCanvasSize(canvas, WIDTH, HEIGHT)

    context.lineJoin = "round"
    context.lineCap = "round"
    context.lineWidth = 5
    context.strokeStyle = "black"

    clearCanvas(canvas)
  }, [])

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">Redux Paint</div>
        <div className="title-bar-controls">
          <button aria-label="Close" />
        </div>
      </div>
      <EditPanel />
      <FilePanel />
      <ColorPanel />
      <ModalLayer />
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
    </div>
  )
}

export default App
