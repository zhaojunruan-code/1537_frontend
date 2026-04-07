import { useCascaderAreaData } from "@vant/area-data";

/**
 * useColPickerData 级联地区选择数据 Hook
 *
 * 使用示例：
 * ```js
 * import { useColPickerData } from '@/hooks/useColPickerData'
 * 
 * const { colPickerData, findChildrenByCode } = useColPickerData()
 * 
 * // 在自定义选择器组件中直接使用 colPickerData 数据
 * const cities = findChildrenByCode(colPickerData, '110000') // 北京市下级城市
 * ```
 *
 * 使用'@vant/area-data'作为数据源，构造ColPicker组件的数据
 * @returns
 */
export function useColPickerData() {
  // '@vant/area-data' 数据源
  const colPickerData = useCascaderAreaData();

  // 根据code查找子节点，不传code则返回所有节点
  function findChildrenByCode(data, code) {
    if (!code) {
      return data;
    }
    for (const item of data) {
      if (item.value === code) {
        return item.children || null;
      }
      if (item.children) {
        const childrenResult = findChildrenByCode(item.children, code);
        if (childrenResult) {
          return childrenResult;
        }
      }
    }
    return null;
  }

  return { colPickerData, findChildrenByCode };
}
