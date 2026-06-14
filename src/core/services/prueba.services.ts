import { httpClient } from '../utils/httpClient';
import type { pruebaInterface } from './interfaces/prueba.interfaces';

const getPrueba = async (): Promise<pruebaInterface> => {
  const response = await httpClient.get<pruebaInterface>(
    'https://yesno.wtf/api',
  );
  return response.data;
};

const postPrueba = async (): Promise<pruebaInterface> => {
  const response = await httpClient.post<pruebaInterface>('/posts', {
    prueba: 'esto es una prueba',
  });
  return response.data;
};

export default {
  getPrueba,
  postPrueba,
};
