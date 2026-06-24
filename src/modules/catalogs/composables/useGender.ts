import { ref, reactive, nextTick } from 'vue';
import { debounce } from '@/core/utils/debounceFunction';

import { TableHeaders } from '@/core/interfaces';
import { useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import catalogServices from '../Services/catalog.services';
import { GenderResponse } from '../interfaces/gender/gender.response.interface';

export function useGender() {
  const headers = ref<TableHeaders[]>([
    {
      field: 'name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const genders = ref<GenderResponse[] | undefined>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const { startLoading, finishLoading } = useLoaderStore();

  const filter_name = ref<string | null>(null);
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const getGenders = async () => {
    try {
      startLoading();
      const filter = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter: filter_name.value,
      };
      const response = await catalogServices.getGenders(filter);

      if (response.statusCode === 200) {
        genders.value = response.data.data;
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const validateAlphaInput = (
    value: string | null,
    regex: RegExp = findRegex,
  ) => {
    if (!value) {
      value = '';
    }
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      filter_name.value = sanitizedValue;
    });
  };

  const cleanSearch = () => {
    if (!filter_name.value || filter_name.value === '') {
      return;
    }
    filter_name.value = null;
    getGenders();
  };

  const findGender = () => {
    if (filter_name.value) {
      getGenders();
    }
  };

  
  const debouncedFindGender = debounce(findGender, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindGender,
    debouncedCleanSearch,
    headers,
    genders,
    pagination,
    filter_name,
    getGenders,
    validateAlphaInput,
    cleanSearch,
    findGender,
  };
}
