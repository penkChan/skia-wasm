'use client'
import { useState, useRef } from 'react';
import { useWasm, Module } from '@/hooks/useWasm';

export default function ImageProcessor() {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const { module, loading } = useWasm();
  const [fibResult, setFibResult] = useState<null | number>(null);

  const handleFib = () => {
    if (module) {
      const result = module.fib(40); // 计算第 40 个斐波那契数
      if (result !== undefined) {
        setFibResult(result);
      }
    }
  };

  const handleImageProcess = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files !== null && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (
            canvas !== null
          ) {
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 获取图像数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 调用 WASM 处理（比 JS 快 10-50 倍）
            const processed = (module as Module).grayscale(imageData);

            ctx.putImageData(processed, 0, 0);
          } else {
            console.error('Canvas not found.');
          }
        };
        img.src = (event.target as FileReader).result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('No file selected.');
    }

  };

  if (loading) return <div>加载 WASM 模块中...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WASM C++ 计算演示</h2>

      <div className="mb-4">
        <button
          onClick={handleFib}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          计算 Fib(40)
        </button>
        {fibResult && <span className="ml-4">结果: {fibResult}</span>}
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageProcess}
          className="mb-2"
        />
        <canvas
          ref={canvasRef}
          className="border border-gray-300 w-75 h-75"
        />
      </div>
    </div>
  );
}