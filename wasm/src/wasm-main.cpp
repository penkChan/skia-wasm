#include <emscripten/emscripten.h>
#include <cmath>

// 对外暴露的函数需要 extern "C"
extern "C" {

// 计算斐波那契数列
int EMSCRIPTEN_KEEPALIVE fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// 图像处理示例：灰度转换
void EMSCRIPTEN_KEEPALIVE grayscale(unsigned char* data, int len) {
    for (int i = 0; i < len; i += 4) {
        unsigned char avg = (data[i] + data[i+1] + data[i+2]) / 3;
        data[i] = data[i+1] = data[i+2] = avg;
    }
}

// 内存分配辅助函数（用于 JS 传递数据给 C++）
unsigned char* EMSCRIPTEN_KEEPALIVE allocate(int size) {
    return (unsigned char*)malloc(size);
}

void EMSCRIPTEN_KEEPALIVE free_memory(void* ptr) {
    free(ptr);
}

}