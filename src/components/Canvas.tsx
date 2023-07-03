"use client";

import { wavedec2flat } from "@/utils/Haar";
import { abs, loge, scaleArray } from "@/utils/arrayOperations";
import { getCanvasPixels } from "@/utils/getCanvasPixels";
import { useRef, useEffect, useState } from "react";

const CANVAS_WIDTH_WEB = 512;
const CANVAS_HEIGHT_WEB = 512;
const CANVAS_HEIGHT_MOBILE = 256;
const CANVAS_WIDTH_MOBILE = 256;

export const Canvas = ({}: {}) => {
  const [drawnPixels, setDrawnPixels] = useState<number[][]>([]);
  const [wavelet, setWavelet] = useState<"haar">("haar");
  const [mode, setMode] = useState<"zero" | "per">("per");
  const [level, setLevel] = useState<number>(1);
  const [clearedCanvas, setClearedCanvas] = useState<boolean>(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(CANVAS_WIDTH_WEB);
  const [canvasHeight, setCanvasHeight] = useState<number>(CANVAS_HEIGHT_WEB);

  useEffect(() => {
    if (window.innerWidth < 600) {
      setCanvasWidth(CANVAS_WIDTH_MOBILE);
      setCanvasHeight(CANVAS_HEIGHT_MOBILE);
    } else {
      setCanvasWidth(CANVAS_WIDTH_WEB);
      setCanvasHeight(CANVAS_HEIGHT_WEB);
    }
  }, []);

  const handleCallBack = ({ el }: { el: number[][] }) => {
    setDrawnPixels(el);
  };

  return (
    <div className="flex gap-2 lg:flex-row flex-col">
      <CanvasDrawing
        onDraw={handleCallBack}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onClear={() => setClearedCanvas(true)}
      />
      <ShowTransformedCanvas
        drawnPixels={drawnPixels}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        wavelet={wavelet}
        mode={mode}
        level={level}
        clearedCanvas={clearedCanvas}
        setClearedCanvas={setClearedCanvas}
      />
      <div className="flex flex-col">
        <label className="text-gray-600">Wavelet transform</label>
        <div className="flex flex-col gap-1">
          <select
            className="border border-gray-300 rounded-md"
            onChange={(event) => {
              setWavelet(event.target.value as "haar");
            }}
          >
            <option value="haar">Haar</option>
          </select>
          <select
            className="border border-gray-300 rounded-md"
            onChange={(event) => {
              setMode(event.target.value as "zero" | "per");
            }}
          >
            <option value="zero">zero</option>
            <option value="per">per</option>
          </select>
          <input
            className="border border-gray-300 rounded-md"
            type="number"
            max={Math.log2(canvasWidth)}
            value={level}
            onChange={(event) => {
              setLevel(parseInt(event.target.value));
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ShowTransformedCanvas = ({
  drawnPixels,
  canvasHeight,
  canvasWidth,
  wavelet,
  mode,
  level,
  clearedCanvas,
  setClearedCanvas,
}: {
  drawnPixels: number[][];
  canvasWidth: number;
  canvasHeight: number;
  wavelet: "haar";
  mode: "zero" | "per";
  level: number;
  clearedCanvas?: boolean;
  setClearedCanvas?: any;
}) => {
  const [timeLastUpdated, setTimeLastUpdated] = useState<number>(0);

  useEffect(() => {
    // only call once every 0.2 seconds max
    const canvas = document.getElementById("new-canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (context && drawnPixels.length > 0 && Date.now() - timeLastUpdated > 3) {
      const imageData = context.createImageData(canvas.width, canvas.height);

      const drawnPixelsFlat = drawnPixels.flat();

      const pixelsBefore = wavedec2flat(
        Array.from(drawnPixelsFlat),
        level,
        wavelet,
        mode
      ).flat();

      const pixelLogAbs = loge(abs(pixelsBefore));
      const pixels = scaleArray(pixelLogAbs, 0, 255);
      // Fill the array with RGBA values
      for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelIndex = i / 4;
        // Modify pixel data based on the scaled pixel values
        imageData.data[i + 0] = 255 - pixels[pixelIndex]; // R value
        imageData.data[i + 1] = 255 - pixels[pixelIndex]; // G value
        imageData.data[i + 2] = 255 - pixels[pixelIndex]; // B value
        imageData.data[i + 3] = pixels[pixelIndex]; // A value (opaque)
      }

      context.putImageData(imageData, 0, 0);
      setTimeLastUpdated(Date.now());
    }
  }, [drawnPixels, wavelet, mode, level]);

  useEffect(() => {
    if (clearedCanvas) {
      const canvas = document.getElementById("new-canvas") as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      setClearedCanvas(false);
    }
  }, [clearedCanvas]);

  return (
    <div>
      <canvas
        id="new-canvas"
        width={canvasWidth}
        height={canvasHeight}
        className="border border-black"
      />
    </div>
  );
};

const CanvasDrawing = ({
  onDraw,
  canvasHeight,
  canvasWidth,
  onClear,
}: {
  onDraw: any;
  canvasWidth: number;
  canvasHeight: number;
  onClear?: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [strokeColor, setStrokeColor] = useState<string>("#FF0000");
  const [strokeLength, setStrokeLength] = useState<number>(5);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        setCtx(context);
      }
    }
  }, []);

  const startDrawing = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const { clientX, clientY } = event.touches ? event.touches[0] : event;
    setIsDrawing(true);
    setLastX(clientX);
    setLastY(clientY);
  };

  const handleClear = () => {
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      onClear();
    }
  };

  const draw = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const { clientX, clientY } = event.touches ? event.touches[0] : event;
    const x = clientX;
    const y = clientY;

    if (ctx) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeLength;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      setLastX(x);
      setLastY(y);
      if (canvasRef.current) {
        const pixels = getCanvasPixels(canvasRef.current);
        onDraw({ el: pixels });
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  };

  const handleStrokeLengthChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStrokeLength(Number(event.target.value));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-black"
      />
      <select
        value={strokeLength}
        onChange={handleStrokeLengthChange}
        className="border border-gray-300 rounded-md mt-2"
      >
        <option value={1}>Thin</option>
        <option value={3}>Normal</option>
        <option value={5}>Thick</option>
        <option value={7}>Very Thick</option>
        <option value={10}>Extra Thick</option>
      </select>
      <button
        onClick={handleClear}
        className="bg-red-500 text-white px-4 py-2 rounded-md mt-2"
      >
        Clear
      </button>
    </div>
  );
};

export default Canvas;
