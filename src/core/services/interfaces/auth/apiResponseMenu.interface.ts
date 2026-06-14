import type { Menu } from '@/core/interfaces/userState.store.interface';

export interface MenuResponseData {
  menus: Menu[];
  profile_img: string | null;
}

export interface ApiResponseMenu<T> {
  data: T;
  message: string;
  statusCode: number;
}
