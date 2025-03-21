import { ref } from 'vue';

export function useThrottle<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timer = ref<NodeJS.Timeout | null>(null);

  const throttled = (...args: Parameters<T>): void => {
    if (timer.value) return;

    timer.value = setTimeout(() => {
      fn(...args);
      timer.value = null;
    }, delay);
  };

  // 清理函数
  const cancel = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  };

  return {
    throttled,
    cancel
  };
}