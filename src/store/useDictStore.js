/**
 * @typedef {Object} DictValueType
 * @property {*} value - 字典项的值
 * @property {string} label - 字典项的标签
 * @property {string} [colorType] - 颜色类型（可选）
 * @property {string} [cssClass] - CSS 类（可选）
 */

/**
 * @typedef {Object} DictTypeType
 * @property {string} dictType - 字典类型
 * @property {DictValueType[]} dictValue - 字典项的数组
 */

import {getSimpleDictDataList} from "@/api/common";

/**
 * @typedef {Object} DictState
 * @property {Map<string, any>} dictMap - 存储字典数据的 Map
 * @property {boolean} isSetDict - 是否已设置字典数据的标志
 */

export const useDictStore = defineStore('dict', {
  /**
   * @returns {DictState} 状态
   */
  state: () => ({
    dictMap: new Map(),
    isSetDict: false
  }),
  getters: {
    /**
     * 获取字典 Map
     * @returns {Map<string, any>} 字典 Map
     */
    getDictMap() {
      return this.dictMap;
    },
    /**
     * 判断字典是否已经设置
     * @returns {boolean} 字典是否已设置
     */
    getIsSetDict() {
      return this.isSetDict;
    }
  },
  actions: {
    /**
     * 提取构建 dictDataMap 的逻辑，避免代码重复
     * @param {Array} res - 获取到的字典数据
     * @returns {Object} 生成的字典数据 Map 对象
     */
    buildDictDataMap(res) {
      const dictDataMap = {};

      res.forEach((dictData) => {
        if (!dictDataMap[dictData.dictType]) {
          dictDataMap[dictData.dictType] = [];
        }
        dictDataMap[dictData.dictType].push({
          value: dictData.value,
          label: dictData.label,
          colorType: dictData.colorType,
          cssClass: dictData.cssClass
        });
      });
      return dictDataMap;
    },

    /**
     * 设置字典 Map
     * @returns {Promise<void>}
     */
    async setDictMap() {
      if (!this.isSetDict) {
        const res = await getSimpleDictDataList();
        this.dictMap = this.buildDictDataMap(res);
        this.isSetDict = true;
      }
    },

    /**
     * 根据类型获取字典
     * @param {string} type 字典类型
     * @returns {Array|undefined} 字典数据
     */
    getDictByType(type) {
      if (!this.isSetDict) {
        this.setDictMap();
      }
      return this.dictMap[type];
    },

    /**
     * 重置字典
     * @returns {Promise<void>}
     */
    async resetDict() {
      const res = await getSimpleDictDataList();
      this.dictMap = this.buildDictDataMap(res);
      this.isSetDict = true;
    }
  }
});
