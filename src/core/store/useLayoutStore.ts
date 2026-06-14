import { defineStore } from 'pinia';
export const useLayoutStore = defineStore('layoutStore', {
  state: () => ({
    sideBar: false,
  }),
  actions: {
    showSideBar(payload: boolean) {
      this.sideBar = payload;
    },
    hideSideBar(payload: boolean) {
      this.sideBar = payload;
    },
  },
});
