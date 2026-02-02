// app/components/BarChart.tsx
"use client";

import { useEffect, useRef } from "react";
import initCanvasKit, {
  Canvas,
  CanvasKit,
  Surface,
  WebGPUCanvasContext,
} from "canvaskit-wasm";

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}

export default function BarChart({
  data,
  width = 600,
  height = 400,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let canvasKit: CanvasKit;

    initCanvasKit({
      locateFile: (file: string) =>
        `https://unpkg.com/canvaskit-wasm@0.39.0/bin/${file}`,
    }).then((CK) => {
      canvasKit = CK;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gpuContext = canvas.getContext("webgpu");
      if (!gpuContext) {
        throw new Error("WebGPU not supported");
      }

      const surface = canvasKit.MakeGPUCanvasSurface(
        {
          // ✨ 关键：CanvasKit-style RAF
          requestAnimationFrame: (drawFrame: (canvas: Canvas) => void) => {
            const frame = () => {
              const skCanvas = (surface as Surface).getCanvas();
              drawFrame(skCanvas);
              (surface as Surface).flush();
            };
            requestAnimationFrame(frame);
          },
        },
        canvasKit.ColorSpace.SRGB,
        canvas.width,
        canvas.height,
      );
      if (!surface) return;

      const ctx = surface.getCanvas();

      // 清空画布
      ctx.clear(canvasKit.Color4f(1, 1, 1, 1));

      // 绘制图表
      drawChart(ctx, canvasKit, data, width, height);

      surface.flush();

      return () => {
        surface.delete();
      };
    });

    return () => {
      (canvasKit as unknown as { endFrame: () => void })?.endFrame();
    };
  }, [data, width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}

function drawChart(
  ctx: Canvas,
  canvasKit: CanvasKit,
  data: { label: string; value: number }[],
  width: number,
  height: number,
) {
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 找到最大值
  const maxValue = Math.max(...data.map((d) => d.value));

  // 绘制网格线
  const gridPaint = new canvasKit.Paint();
  gridPaint.setColor(canvasKit.Color(230, 230, 230));
  gridPaint.setStyle(canvasKit.PaintStyle.Stroke);
  gridPaint.setStrokeWidth(1);

  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * chartHeight;
    const path = canvasKit.Path.Make();;
    path.moveTo(padding, y);
    path.lineTo(width - padding, y);
    ctx.drawPath(path, gridPaint);
    path.delete();
  }

  gridPaint.delete();

  // 绘制柱状图
  const barWidth = (chartWidth / data.length) * 0.7;
  const colors = [
    canvasKit.Color(74, 144, 226),
    canvasKit.Color(245, 166, 35),
    canvasKit.Color(60, 179, 113),
    canvasKit.Color(211, 63, 106),
    canvasKit.Color(147, 112, 219),
    canvasKit.Color(255, 140, 0),
    canvasKit.Color(50, 205, 50),
    canvasKit.Color(138, 43, 226),
  ];

  const barPaint = new canvasKit.Paint();
  barPaint.setStyle(canvasKit.PaintStyle.Fill);
  barPaint.setAntiAlias(true);

  const textPaint = new canvasKit.Paint();
  textPaint.setColor(canvasKit.Color(50, 50, 50));
  textPaint.setAntiAlias(true);

  const font = new canvasKit.Font(null, 14);
  const valueFont = new canvasKit.Font(null, 12);

  data.forEach((item, index) => {
    const x =
      padding + (index + 0.5) * (chartWidth / data.length) - barWidth / 2;
    const barHeight = (item.value / maxValue) * chartHeight;
    const y = height - padding - barHeight;

    // 绘制柱子
    barPaint.setColor(colors[index % colors.length]);
    const rect = canvasKit.XYWHRect(x, y, barWidth, barHeight);
    ctx.drawRect(rect, barPaint);

    // 绘制数值标签
    textPaint.setColor(canvasKit.Color(80, 80, 80));
    ctx.drawText(
      item.value.toString(),
      x + barWidth / 2,
      y - 5,
      valueFont,
      textPaint,
    );

    // 绘制X轴标签
    textPaint.setColor(canvasKit.Color(100, 100, 100));
    ctx.drawText(
      item.label,
      x + barWidth / 2,
      height - padding + 20,
      font,
      textPaint,
    );
  });

  // 绘制标题
  const titleFont = new canvasKit.Font(null, 20);
  const titlePaint = new canvasKit.Paint();
  titlePaint.setColor(canvasKit.Color(50, 50, 50));
  titlePaint.setAntiAlias(true);
  ctx.drawText("Monthly Sales", width / 2, 30, titleFont, titlePaint);
  titlePaint.delete();
  titleFont.delete();

  // 清理资源
  barPaint.delete();
  textPaint.delete();
  font.delete();
  valueFont.delete();
}
