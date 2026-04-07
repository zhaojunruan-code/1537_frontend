import { defineStore } from "pinia";

export const useTabbarStore = defineStore(
  "tabbar",
  {
    state: () => {
      return {
        tabbarIndex: 0
      };
    },
    actions: {
      handleChangeTabbar(item) {
        try {
          if (item.centerItem) {
            return uni.navigateTo({ url: item.path });
          }

          return uni.switchTab({
            url: item.path
          });
        } finally {
          this.tabbarIndex = item.id;
        }
      }
    }
  }
);
