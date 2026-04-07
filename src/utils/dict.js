import {useDictStore} from "@/store/useDictStore";

/**
 * 数据字典工具类
 */
const dictStore = useDictStore()

/**
 * 获取 dictType 对应的数据字典数组
 *
 * @param {string} dictType 数据类型
 * @returns {Array} 数据字典数组
 */
export const getDictOptions = (dictType) => {
  return dictStore.getDictByType(dictType) || []
}

/**
 * @typedef {Object} DictDataType
 * @property {string} dictType - 字典类型
 * @property {string} label - 标签
 * @property {string|number|boolean} value - 值
 * @property {string} colorType - 颜色类型
 * @property {string} cssClass - 样式类
 */

/**
 * @typedef {DictDataType} NumberDictDataType
 * @property {number} value - 数值类型的字典值
 */

/**
 * @typedef {DictDataType} StringDictDataType
 * @property {string} value - 字符串类型的字典值
 */

/**
 * 获取整数类型的字典选项
 * @param {string} dictType 字典类型
 * @returns {NumberDictDataType[]} 数字字典选项
 */
export const getIntDictOptions = (dictType) => {
  const dictOptions = getDictOptions(dictType)
  const dictOption = []
  dictOptions.forEach((dict) => {
    dictOption.push({
      ...dict,
      value: parseInt(dict.value + '')
    })
  })
  return dictOption
}

/**
 * 获取字符串类型的字典选项
 * @param {string} dictType 字典类型
 * @returns {StringDictDataType[]} 字符串字典选项
 */
export const getStrDictOptions = (dictType) => {
  const dictOptions = getDictOptions(dictType)
  const dictOption = []
  dictOptions.forEach((dict) => {
    dictOption.push({
      ...dict,
      value: dict.value + ''
    })
  })
  return dictOption
}

/**
 * 获取布尔类型的字典选项
 * @param {string} dictType 字典类型
 * @returns {DictDataType[]} 布尔字典选项
 */
export const getBoolDictOptions = (dictType) => {
  const dictOption = []
  const dictOptions = getDictOptions(dictType)
  dictOptions.forEach((dict) => {
    dictOption.push({
      ...dict,
      value: dict.value + '' === 'true'
    })
  })
  return dictOption
}

/**
 * 获取指定字典类型的指定值对应的字典对象
 * @param {string} dictType 字典类型
 * @param {*} value 字典值
 * @return {DictDataType|undefined} 字典对象
 */
export const getDictObj = (dictType, value) => {
  const dictOptions = getDictOptions(dictType)
  for (const dict of dictOptions) {
    if (dict.value === value + '') {
      return dict
    }
  }
}

/**
 * 获得字典数据的文本展示
 *
 * @param {string} dictType 字典类型
 * @param {*} value 字典数据的值
 * @return {string} 字典名称
 */
export const getDictLabel = (dictType, value) => {
  const dictOptions = getDictOptions(dictType)
  let dictLabel = ''
  dictOptions.forEach((dict) => {
    if (dict.value === value + '') {
      dictLabel = dict.label
    }
  })
  return dictLabel
}

/**
 * 字典类型枚举
 * @enum {string}
 */
export const DICT_TYPE = {
  // 这个枚举要后端提供，或者自己在后台添加，目前只支持Java的后台
  // USER_TYPE: 'user_type',  // 举例
}
