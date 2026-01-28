// src/hooks/useWasm.js
import { useState, useEffect } from "react";

export type Module = {
  fib: (n: number) => number;
  grayscale: (imageData: ImageData) => ImageData;
};

export interface WasmModule extends EmscriptenModule {
  _fib: (n: number) => number;
  _grayscale: (ptr: number, len: number) => void;
  _allocate: (size: number) => number;
  _free_memory: (ptr: number) => void;
  ccall: <T = number | string>(
    ident: string,
    returnType: string,
    argTypes: string[],
    args: T[],
  ) => T;
  writeArrayToMemory: (array: Uint8Array | number[], bufferPtr: number) => void;
  getValue: (ptr: number, type: string) => number;
}
export function useWasm() {
  const [module, setModule] = useState<null | Module>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // 动态导入胶水代码
        const createModule = await import("../public/wasm-main.js");
        console.log(createModule);
        const instance = (await createModule.default()) as WasmModule;

        // 封装成易用的 API
        const api: Module = {
          fib: (n) => instance.ccall("fib", "number", ["number"], [n]),
          grayscale: (imageData) => {
            const len = imageData.data.length;
            const ptr = instance._allocate(len);

            // 将图像数据写入 WASM 内存
            instance.writeArrayToMemory(
              new Uint8Array(imageData.data.buffer),
              ptr,
            );

            // 调用 C++ 函数
            instance._grayscale(ptr, len);
            const result = new Uint8ClampedArray(len);
            // 读回结果
            result.set(instance.HEAPU8.subarray(ptr, ptr + len));

            instance._free_memory(ptr);
            console.log(result);
            return new ImageData(result, imageData.width, imageData.height);
          },
        };

        setModule(api);
      } catch (err) {
        console.error("WASM 加载失败:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWasm();
  }, []);

  return { module, loading };
}
