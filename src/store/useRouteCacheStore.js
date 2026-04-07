import { defineStore } from "pinia";

const initState = {
  key: "",
  data: {}
}

export const useRouteCacheStore = defineStore("routeCacheStore", () => {
  const cache = ref(initState);

  const onSaveRouteCache = (state) => {
    if (!state.key) {
      return;
    }
    cache.value = state;
  };

  const useRouteCache = () => {
    if (!cache.value.key) {
      return {};
    }
    return cache.value;
  };

  return {
    onSaveRouteCache,
    useRouteCache
  };
});
