import { defineStore } from 'pinia';
import { jwtDecode, JwtPayload } from 'jwt-decode';

import {
  UserStateStore,
  Token,
  Menu,
  RefreshToken,
} from '../interfaces/userState.store.interface';

interface State {
  user: UserStateStore | null | string;
  token: Token | null | string;
  token_type: string | null;
  menu: Menu[];
  menuSideBar: Menu[];
  refresh_token: RefreshToken | null | string;
  profile_img: string | null;
}

const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(
      `Error al parsear el item para la llave ${key} en el localStorage`,
      e,
    );
    return null;
  }
};

const setToLocalStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error al settear el item para la llave ${key}`, e);
  }
};

const removeAllFromLocalStorage = (keys: string[]) => {
  keys.forEach(key => localStorage.removeItem(key));
};

export const useAuthStore = defineStore('authStore', {
  state: (): State => ({
    user: getFromLocalStorage('user'),
    token: localStorage.getItem('access_token')
      ? localStorage.getItem('access_token')
      : null,
    token_type: localStorage.getItem('token_type')
      ? localStorage.getItem('token_type')
      : null,
    refresh_token: localStorage.getItem('refresh_token')
      ? localStorage.getItem('refresh_token')
      : null,
    menu: getFromLocalStorage('menu') || [],
    menuSideBar: [],
    profile_img: localStorage.getItem('profile_img') || null,
  }),
  getters: {
    userInfo(): UserStateStore | null | string {
      if (this.user) {
        return this.user;
      }
      return null;
    },
    tokenInfo(): Token | null | string {
      if (this.token) {
        return this.token;
      }
      return null;
    },
    refreshTokenInfo(): RefreshToken | null | string {
      if (this.refresh_token) {
        return this.refresh_token;
      }
      return null;
    },
    tokenTypeInfo(): null | string {
      if (this.token_type) {
        return this.token_type;
      }
      return null;
    },
    menuInfo(): Menu[] {
      return this.menu;
    },
    menuSideBarInfo(): Menu[] {
      return this.menuSideBar;
    },
    profileImg(): string | null {
      return this.profile_img;
    },
  },
  actions: {
    setUserInfo(payload: UserStateStore) {
      this.user = payload;
      setToLocalStorage('user', payload);
    },
    setToken(payload: Token) {
      this.token = payload.access_token;
      localStorage.setItem('access_token', payload.access_token);
    },
    setRefreshToken(payload: RefreshToken) {
      this.refresh_token = payload.refresh_token;
      localStorage.setItem('refresh_token', payload.refresh_token);
    },
    setTokenType(payload: string) {
      this.token_type = payload;
      localStorage.setItem('token_type', payload);
    },
    setMenu(payload: Menu[]) {
      this.menu = payload;
      //setToLocalStorage('menu', payload);
    },
    setMenuSideBar(payload: Menu[]) {
      this.menuSideBar = payload;
    },
    setProfileImg(payload: string | null) {
      this.profile_img = payload;
      if (payload) {
        localStorage.setItem('profile_img', payload);
      } else {
        localStorage.removeItem('profile_img');
      }
    },
    isTokenExpired(): boolean {
      if (!this.token) return true;
      try {
        const decoded = jwtDecode<JwtPayload>(this.token as string);

        if (!decoded.exp) return true;

        const now = Math.floor(Date.now() / 1000);

        return decoded.exp < now;
      } catch (error) {
        console.error('Erorro al decodificar el token: ', error);
        return true;
      }
    },
    validSession(): boolean {
      if (!this.user || !this.token || this.isTokenExpired()) return false;
      return true;
    },
    closeSession() {
      this.user = null;
      this.token = null;
      this.refresh_token = null;
      this.token_type = null;
      this.menu = [];
      this.profile_img = null;
      removeAllFromLocalStorage([
        'access_token',
        'user',
        'menu',
        'token_type',
        'refresh_token',
        'profile_img',
      ]);
    },
  },
});
