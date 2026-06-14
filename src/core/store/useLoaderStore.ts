import { defineStore } from 'pinia';

export const useLoaderStore = defineStore('loader', {
  state: () => ({
    activeRequest: 0,
  }),
  getters: {
    isLoading: (state): boolean => state.activeRequest > 0,
  },
  actions: {
    startLoading() {
      this.activeRequest++;
    },
    finishLoading() {
      if (this.activeRequest > 0) {
        this.activeRequest--;
      }
    },
  },
});
