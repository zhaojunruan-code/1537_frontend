import { defineStore } from 'pinia'

export const useRecordStore = defineStore('records', {
  state: () => ({
    records: []
  }),

  getters: {
    recentRecords: (state) => state.records.slice(0, 3),
    gradeCount: (state) => state.records.filter(r => r.type === 'grade').length,
    writeCount: (state) => state.records.filter(r => r.type === 'write').length,
    getRecordById: (state) => (id) => state.records.find(r => r.id === id)
  },

  actions: {
    addRecord(record) {
      this.records.unshift(record)
    },
    addRecords(newRecords) {
      this.records.unshift(...newRecords)
    },
    clearRecords() {
      this.records = []
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: {
          getItem: (key) => uni.getStorageSync(key),
          setItem: (key, value) => uni.setStorageSync(key, value)
        }
      }
    ]
  }
})
