import { useMemo } from 'react';

export function useService<T>(serviceKey: string): T {
  return useMemo(() => {
    console.warn(`服务 ${serviceKey} 未实现，返回空对象`);
    return {} as T;
  }, [serviceKey]);
}