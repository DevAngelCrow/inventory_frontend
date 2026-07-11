// composables/useAuth.ts
import { nextTick, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

import { emailFormat, passwordValidation } from '@/core/utils/validationRules';
import { useAlertStore, useLoaderStore } from '@/core/store';
import authServices from '@/core/services/auth.services';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { useAuthStore } from '@/core/store/useAuthStore';
import { CreateDateFromFormat, FormatDate } from '@/core/utils/dates';
import { PrimeVueFile } from '@/types/PrimeVueFile';
import { DocumentType } from '@/core/services/interfaces/auth/documentType.interface';
import { Gender } from '@/core/services/interfaces/auth/gender.interface';
import { MaritalStatus } from '@/core/services/interfaces/auth/maritalStatus.interface';
import { Country } from '@/core/services/interfaces/auth/country.interface';
//import { GeographicDivisionTypeResponse } from '@/modules/catalogs/interfaces/geographic-division-type/geographic-division-type.response.interface';
import { GeographicDivisionResponse } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.response.interface';

import { DocumentTypeObject } from '../interfaces/documentType.interface';
import { NationalitiesArray } from '../interfaces/nationalitiesArray.interface';

export function useAuth() {
  const {
    setToken,
    setUserInfo,
    setTokenType,
    setRefreshToken,
    setMenu,
    setProfileImg,
    userInfo,
  } = useAuthStore();
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();
  const router = useRouter();
  const route = useRoute();
  const isLoading = ref(false);
  const isLoggingOut = ref(false);
  const error = ref<string | null>(null);
  const API_URL =
    import.meta.env.VITE_VUE_APP_API_URL || 'http://127.0.0.1:8000';

  const form = useForm({
    validationSchema: yup.object({
      email: emailFormat(undefined, true, undefined),
      password: passwordValidation().optional(),
      firstName: yup
        .string()
        .optional()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .matches(/^[a-zA-ZáÁéÉíÍóÓúÚñÑ ]*$/, 'No caracteres invalidos')
        .transform(
          value => value?.replace(/[^a-zA-ZáÁéÉíÍóÓúÚñÑ ]/g, '') || '',
        ),
      middleName: yup
        .string()
        .optional()
        .min(3, 'El segundo nombre debe tener al menos 3 caracteres'),
      lastName: yup
        .string()
        .optional()
        .matches(/^[a-zA-ZáÁéÉíÍóÓúÚñÑ ]*$/, 'No caracteres invalidos')
        .min(3, 'El apellido debe tener al menos 3 caracteres'),
      birthDate: yup
        .string()
        .optional()
        .test('is-date', 'Formato inválido, usa DD/MM/YYYY', value => {
          if (!value) return true;
          const parsed = CreateDateFromFormat(value, 'DD/MM/YYYY');
          return parsed instanceof Date;
        }),
      gender: yup.string().optional(),
      maritalStatus: yup.string().optional(),
      phoneNumber: yup.string().optional().min(9).max(9),
      status: yup.string().optional(),
      nationalities: yup.array<NationalitiesArray>().optional(),
      file_img: yup
        .mixed<PrimeVueFile[]>()
        .optional()
        .test('fileSize', 'El tamaño de la imágen es muy grande', value => {
          if (!value || (value as PrimeVueFile[]).length === 0) return true;
          return (value as PrimeVueFile[]).every(file => file.size <= 1000000);
        })
        .test('fileType', 'Formato no permitido', value => {
          if (!value || (value as PrimeVueFile[]).length === 0) return true;
          return (value as PrimeVueFile[]).every(file =>
            ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
          );
        }),
      street: yup.string().optional().min(3),
      streetNumber: yup.string().optional().min(1),
      neighborhood: yup.string().optional().min(3),
      geographic_divisions: yup
        .object({
          id: yup.string(),
        })
        .optional()
        .nullable(),
      houseNumber: yup.string().optional().min(1),
      block: yup
        .string()
        .optional()
        .min(1, 'El campo del block debe tener al menos 1 caracter'),
      pathway: yup.string().optional().min(1),
      current: yup.boolean().optional(),
      //personal document info
      documentType: yup.object<DocumentTypeObject>().optional().nullable(),
      documentNumber: yup.string().optional().nullable(),
      //user info
      userName: yup.string().optional(),
      country: yup
        .object({
          id: yup.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  });

  const [email, emailAttrs] = form.defineField('email');
  const [password, passwordAttrs] = form.defineField('password');
  const [firstName, firstNameAttrs] = form.defineField('firstName');
  const [middleName, middleNameAttrs] = form.defineField('middleName');
  const [lastName, lastNameAttrs] = form.defineField('lastName');
  const [birthDate, birthDateAttrs] = form.defineField('birthDate');
  const [gender, genderAttrs] = form.defineField('gender');
  const [maritalStatus, maritalStatusAttrs] = form.defineField('maritalStatus');
  const [phoneNumber, phoneNumberAttrs] = form.defineField('phoneNumber');
  const [status, statusAttrs] = form.defineField('status');
  const [nationalities, nationalitiesAttrs] = form.defineField('nationalities');
  const [file_img, fileImgAttrs] = form.defineField('file_img');
  const [street, streetAttrs] = form.defineField('street');
  const [streetNumber, streetNumberAttrs] = form.defineField('streetNumber');
  const [neighborhood, neighborhoodAttrs] = form.defineField('neighborhood');
  const [geographic_divisions, geographicDivisionsAttrs] = form.defineField(
    'geographic_divisions',
  );
  const [houseNumber, houseNumberAttrs] = form.defineField('houseNumber');
  const [block, blockAttrs] = form.defineField('block');
  const [pathway, pathwayAttrs] = form.defineField('pathway');
  const [current, currentAttrs] = form.defineField('current');
  const [documentType, documentTypeAttrs] = form.defineField('documentType');
  const [documentNumber, documentNumberAttrs] =
    form.defineField('documentNumber');
  const [userName, userNameAttrs] = form.defineField('userName');
  const [country, countryAttrs] = form.defineField('country');
  const nationalitiesOptions = ref<NationalitiesArray[]>([]);
  const documentTypesOptions = ref<DocumentType[]>([]);
  const gendersOptions = ref<Gender[]>([]);
  const maritalStatusesOptions = ref<MaritalStatus[]>([]);
  const countriesOptions = ref<Country[]>([]);
  const geographicDivisionsOptions = ref<GeographicDivisionResponse[]>([]);
  const documentTypeId = ref<string>('');
  const editMode = ref<boolean>(false);
  const idPeople = ref<string>('');
  const idAddress = ref<string>('');
  const idDocument = ref<string>('');

  const getNationalities = async () => {
    try {
      const response = await authServices.getCountriesNationalities();
      if (response.statusCode === 200) {
        nationalitiesOptions.value = response.data.data;
        countriesOptions.value = response.data.data;
      }
    } catch (error) {
      console.error('Error al obtener las nacionalidades:', error);
    }
  };
  const getDocumentTypes = async () => {
    try {
      const response = await authServices.getDocumentTypes();
      if (response.statusCode === 200) {
        documentTypesOptions.value = response.data.data.map(
          (item: DocumentType) => ({
            active: item.active,
            id: item.id,
            name: item.name,
            description: item.description,
            mask: item.mask,
          }),
        );
      }
    } catch (error) {
      console.error('Error al obtener los tipos de documento:', error);
    }
  };
  const getGenders = async () => {
    try {
      const response = await authServices.getGenders();
      if (response.statusCode === 200) {
        gendersOptions.value = response.data.data;
      }
    } catch (error) {
      console.error('Error al obtener los géneros:', error);
    }
  };
  const getMaritalStatuses = async () => {
    try {
      const response = await authServices.getMaritalStatus();
      if (response.statusCode === 200) {
        maritalStatusesOptions.value = response.data.data;
      }
    } catch (error) {
      console.error('Error al obtener los estados civiles:', error);
    }
  };
  const getGeographicalDivisions = async (params: string) => {
    try {
      const response = await authServices.getGeographicalDivisions({
        id_type: params,
      });
      if (response.statusCode === 200) {
        geographicDivisionsOptions.value = response.data.data;
      }
    } catch (error) {
      console.error('Error al obtener las divisiones geográficas:', error);
    }
  };

  const getDetailsProfile = async () => {
    try {
      if (userInfo && typeof userInfo === 'object' && 'id' in userInfo) {
        const idUser = userInfo.id;
        const response = await authServices.getProfileDetails(idUser);
        if (response.statusCode === 200) {
          email.value = response.data.email;
          userName.value = response.data.user_name;
          firstName.value = response.data.first_name;
          middleName.value = response.data.middle_name;
          lastName.value = response.data.last_name;
          maritalStatus.value = response.data.id_marital_status;
          birthDate.value = FormatDate(
            response.data.birth_date ?? '',
            'DD/MM/YYYY',
          );
          nationalities.value = response.data.nationalities;
          gender.value = response.data.id_gender;
          phoneNumber.value = response.data.phone_number;
          status.value = response.data.id_status;
          documentType.value = response.data?.document_type; // Direct assignment
          documentTypeId.value = response.data.document_type?.id;
          documentNumber.value = response.data.document?.document_number;
          country.value = response.data.country || null; // Direct assignment
          geographic_divisions.value =
            response.data.geographic_division || null; // Direct assignment
          street.value = response.data.street;
          streetNumber.value = response.data.street_number;
          houseNumber.value = response.data.house_number;
          neighborhood.value = response.data.neighborhood;
          block.value = response.data.block;
          pathway.value = response.data.pathway;
          current.value = response.data.current;
          idPeople.value = response.data.id_people || '';
          idAddress.value = response.data.id_address || '';
          idDocument.value = response.data.document?.id || '';
          setProfileImg(response.data.profile_img ?? null);
        }
      }
      console.warn(
        'No se pudo obtener el ID del usuario para cargar los detalles del perfil',
      );
    } catch (error) {
      console.error('Error al obtener los detalles del perfil:', error);
    }
  };
  const login = async (user: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_name: user,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Error en el servidor' }));

        if (response.status === 401) {
          throw new Error(errorData.message || 'Credenciales incorrectas');
        }

        throw new Error(
          errorData.message ||
          `Error ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      if (data.data.access_token) {
        setToken(data.data);
        if (data.data.refresh_token) {
          setRefreshToken(data.data);
        }
        if (data.data.user) {
          setUserInfo(data.data);
        }

        if (data.data.token_type) {
          setTokenType(data.data.token_type);
        }

        const menu = await authServices.getMenu();

        if (menu.statusCode === 200) {
          setMenu(menu.data.menus);
          setProfileImg(menu.data.profile_img);
          localStorage.setItem('menu', JSON.stringify(menu.data.menus));
        }

        const redirectTo = (route.query.redirect as string) || '/';
        router.push(redirectTo);
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (err) {
      console.error('Error en el login:', err);
      error.value =
        err instanceof Error ? err.message : 'Error desconocido en el login';
    } finally {
      isLoading.value = false;
    }
  };
  const logout = async () => {
    isLoggingOut.value = true;
    try {
      const token = localStorage.getItem('access_token');
      //const refreshToken = localStorage.getItem('refresh_token');
      const tokenType = localStorage.getItem('token_type') || 'Bearer';
      if (token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `${tokenType} ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          console.warn('No se pudo notificar al servidor sobre el logout');
        });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      localStorage.removeItem('menu');
      router.push('/login');
    }
  };

  const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const getToken = () => {
    return localStorage.getItem('auth_token');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    return token ? `${tokenType} ${token}` : null;
  };

  // Eliminar duplicado y dejar solo una función useAuth y registerUser

  const registerUser = async (data: { email: string; password: string }) => {
    try {
      // Crear FormData y agregar solo email y password
      const form = new FormData();
      form.append('email', data.email);
      form.append('password', data.password);
      const response = await authServices.signUp(form);
      // Manejar respuesta genérica
      if (response.status === 201) {
        alert.showAlert({
          type: 'success',
          title: 'Registro exitoso',
          content: 'El usuario ha sido registrado correctamente',
        });
        router.push('/login');
      } else {
        let errorMsg = 'No se pudo registrar el usuario';
        if (
          response.data &&
          typeof response.data === 'object' &&
          'message' in response.data
        ) {
          errorMsg = (response.data as any).message || errorMsg;
        }
        alert.showAlert({
          type: 'error',
          title: 'Error en el registro',
          content: errorMsg,
        });
      }
    } catch (error) {
      console.error(error);
      alert.showAlert({
        type: 'error',
        title: `Error en el registro del usuario`,
        content: 'Ocurrió un error al momento del registro del usuario',
      });
    }
  };

  // Declarar validationInputEmail para evitar error de propiedad no encontrada
  const validationInputEmail = (
    value: string,
    input: string,
    regex: RegExp = /[^a-zA-Z0-9._%+\-@]/g,
  ) => {
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      form?.setFieldValue(input, sanitizedValue);
    });
  };

  const validationInputAlphanumeric = (
    value: string,
    input: string,
    regex: RegExp = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ@.0-9 ]/g,
  ) => {
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      form?.setFieldValue(input, sanitizedValue);
    });
  };

  const validationInputPassword = (
    value: string,
    input: string,
    regex: RegExp = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ@.0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
  ) => {
    let sanitizedValue: string | undefined = sanitizedValueInput(value, regex);
    nextTick(() => {
      form?.setFieldValue(input, sanitizedValue);
    });
  };

  const updateProfile = form.handleSubmit(async values => {
    try {
      startLoading();
      if (!userInfo || typeof userInfo !== 'object' || !('id' in userInfo)) {
        throw new Error('User info is missing');
      }
      const formData = new FormData();
      formData.append('id_people', idPeople.value);
      formData.append('id_address', idAddress.value);
      formData.append('id_document', idDocument.value);
      formData.append('first_name', values.firstName || '');
      formData.append('middle_name', values.middleName || '');
      formData.append('last_name', values.lastName || '');
      if (values.birthDate) {
        const parsed = CreateDateFromFormat(values.birthDate, 'DD/MM/YYYY');
        if (parsed instanceof Date) {
          formData.append('birthdate', parsed.toISOString().split('T')[0]);
        }
      }
      formData.append('email', values.email || '');
      formData.append('id_gender', values.gender || '');
      formData.append('id_marital_status', values.maritalStatus || '');
      formData.append('phone', values.phoneNumber || '');
      formData.append('id_status', values.status?.toString() || '');
      formData.append('user_name', values.userName || '');
      formData.append('street', values.street || '');
      formData.append('street_number', values.streetNumber || '');
      formData.append('neighborhood', values.neighborhood || '');
      formData.append(
        'id_geographic_division',
        values.geographic_divisions?.id || '',
      );
      formData.append('house_number', values.houseNumber || '');
      formData.append('block', values.block || '');
      formData.append('pathway', values.pathway || '');
      formData.append('current', String(values.current === true));
      formData.append('active_address', 'true');
      formData.append(
        'id_type_document',
        values.documentType?.id || documentTypeId.value || '',
      );
      formData.append('document_number', values.documentNumber || '');
      formData.append('description', 'Documento principal');
      formData.append('active', 'true');

      if (values.nationalities && values.nationalities.length > 0) {
        values.nationalities.forEach((nat: any) => {
          formData.append('nationalities', nat.id || nat);
        });
      }

      if (values.file_img && values.file_img.length > 0) {
        formData.append('file_img', values.file_img[0] as unknown as Blob);
      }
      const response = await authServices.updateProfile(userInfo.id, formData);
      if (response.statusCode === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Perfil actualizado',
          content: 'El perfil se actualizó correctamente',
        });
        editMode.value = false;
        await getDetailsProfile();
      }
    } catch (err: any) {
      console.error('Error al actualizar el perfil:', err);
      alert.showAlert({
        type: 'error',
        title: 'Error',
        content: err.message || 'Error al actualizar el perfil',
      });
    } finally {
      finishLoading();
    }
  });

  return {
    ...form,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    getAuthHeader,
    isLoading,
    error,
    registerUser,
    validationInputAlphanumeric,
    validationInputEmail,
    validationInputPassword,
    getNationalities,
    getDocumentTypes,
    getGenders,
    getMaritalStatuses,
    getGeographicalDivisions,
    startLoading,
    finishLoading,
    getDetailsProfile,
    email,
    emailAttrs,
    password,
    passwordAttrs,
    firstName,
    firstNameAttrs,
    middleName,
    middleNameAttrs,
    lastName,
    lastNameAttrs,
    birthDate,
    birthDateAttrs,
    gender,
    genderAttrs,
    maritalStatus,
    maritalStatusAttrs,
    phoneNumber,
    phoneNumberAttrs,
    status,
    statusAttrs,
    nationalities,
    nationalitiesAttrs,
    file_img,
    fileImgAttrs,
    street,
    streetAttrs,
    streetNumber,
    streetNumberAttrs,
    neighborhood,
    neighborhoodAttrs,
    geographic_divisions,
    geographicDivisionsAttrs,
    houseNumber,
    houseNumberAttrs,
    block,
    blockAttrs,
    pathway,
    pathwayAttrs,
    current,
    currentAttrs,
    documentType,
    documentTypeAttrs,
    documentNumber,
    documentNumberAttrs,
    userName,
    userNameAttrs,
    country,
    countryAttrs,
    documentTypeId,
    nationalitiesOptions,
    documentTypesOptions,
    gendersOptions,
    maritalStatusesOptions,
    countriesOptions,
    geographicDivisionsOptions,
    form,
    editMode,
    updateProfile,
    idPeople,
    idAddress,
    idDocument,
  };
}
