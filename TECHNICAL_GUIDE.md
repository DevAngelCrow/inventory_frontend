# Guía Técnica del Frontend (inventory_frontend)

Esta guía detalla la arquitectura, estándares de diseño, patrones de código y flujos de trabajo del frontend del Sistema de Inventario y Facturación para Alquiler de Mobiliario. Está diseñada para que desarrolladores o agentes de IA comprendan rápidamente la estructura del repositorio sin necesidad de escanearlo por completo.

---

## 🚀 Arquitectura y Tecnologías Core

El proyecto está construido utilizando la última versión de **Vue 3** y empaquetado con **Vite**. Sigue un enfoque modular y orientado a componentes independientes.

| Capa | Tecnología / Librería | Descripción |
| :--- | :--- | :--- |
| **Framework** | Vue 3 (Composition API) | Uso estricto de `<script setup lang="ts">`. |
| **Estilos** | TailwindCSS 4.0 | Utilidades utilitarias premium para posicionamiento y micro-ajustes. |
| **Componentes UI** | PrimeVue v4 | Biblioteca de componentes ricos con animaciones fluidas y accesibilidad. |
| **Tema Custom** | PrimeVue Aura / Custom | Definido en `src/customTheme.ts` con variables HSL armonizadas. |
| **Gestión de Estado** | Pinia 3.0 | Tiendas ligeras para sesión (`useAuthStore`) y UI (`useLayoutStore`). |
| **Manejo de Formularios** | VeeValidate 4.15 + Yup 1.6 | Control estricto de validación en tiempo real y tipado de campos. |
| **Cliente HTTP** | Axios 1.10 | Envoltura personalizada `httpClient` para interceptores JWT/Refresh. |
| **Gestión de Fechas** | DayJS 1.11 | Parseo y formateo de fechas y horas locales. |

---

## 📂 Estructura de Directorios

El código fuente está dividido en dos grandes secciones: `core` (recursos compartidos globales) y `modules` (dominios funcionales del negocio).

```text
src/
├── core/                  # Recursos y configuraciones transversales
│   ├── assets/            # Estilos CSS globales, logos y multimedia
│   ├── components/        # Wrappers reutilizables de componentes de UI
│   ├── config/            # Configuraciones iniciales y constantes
│   ├── directives/        # Directivas personalizadas de Vue (ej: debounce)
│   ├── interfaces/        # Interfaces globales compartidas
│   ├── layouts/           # Plantilla general (Layout.vue) con Header y Sidebar
│   ├── plugins/           # Configuraciones de plugins externos
│   ├── router/            # Enrutador principal de la app (Vue Router)
│   ├── services/          # Tipados e interfaces para llamadas HTTP genéricas
│   ├── store/             # Tiendas Pinia de estado global (auth, loaders, alerts)
│   └── utils/             # Funciones utilitarias (fechas, validadores de input)
│
├── modules/               # Capa modular de negocio
│   ├── auth/              # Módulo de autenticación (Login, Registro, Perfil)
│   ├── admin/             # Módulo de administración (Roles, Permisos, Rutas)
│   ├── catalogs/          # Módulos de catálogos base (Países, Municipios, etc.)
│   └── (nuevos módulos)/  # Módulos del sistema de inventario y alquiler
│
├── App.vue                # Componente raíz
└── main.ts                # Inicializador de la aplicación
```

### Anatomía de un Módulo de Negocio
Cada subcarpeta dentro de `src/modules/` debe seguir esta estructura interna para garantizar el desacoplamiento:

```text
src/modules/mi-modulo/
├── components/            # Modales o subcomponentes específicos del módulo
├── composables/           # Lógica de estado local, validación de formularios y handlers
├── interfaces/            # Tipados TypeScript locales del módulo
├── Services/              # Archivos de interacción directa con la API (Axios)
├── views/                 # Páginas de pantalla completa que se registran en las rutas
└── routes.ts              # Arreglo de rutas correspondientes al módulo
```

---

## 🎨 Guía de Estilos y Diseño Premium

El diseño del sistema se alinea a los principios de **Rich Aesthetics**:
* **Modo y Paleta:** Se prioriza un esquema de color moderno utilizando variables CSS enlazadas a Tailwind y PrimeVue. Evitamos colores planos agresivos (red/blue puros).
* **Animaciones:** Todas las interacciones de hover, apertura de modales y transiciones de carga utilizan transiciones suaves (`transition-all duration-300`).
* **Tipografía:** Se configura una fuente moderna legible y limpia desde el archivo principal de estilos.

---

## 📦 Componentes Wrapper Reutilizables (`src/core/components/`)

Para asegurar la uniformidad, no se deben usar componentes nativos de PrimeVue directamente en las vistas si existe un componente wrapper en el `core`:

### 1. `AppDataTable.vue`
Maneja de forma transparente la paginación, el buscador y las filas de datos.
```vue
<AppDataTable
  :headers="headers"
  :items="itemsList"
  :paginator="true"
  :per_page="pagination.per_page"
  :total_items="pagination.total_items"
  :page="pagination.page"
  @page-update="handlePagination"
  @per-page-update="handlePerPage"
>
  <template #body-acciones="{ data }">
    <Button icon="pi pi-pencil" @click="editItem(data)" />
  </template>
</AppDataTable>
```

### 2. Inputs de Formulario con FloatLabel
* **`AppInputText`**: Entrada de texto regular con FloatLabel y soporte de errores integrados.
* **`AppInputNumber`**: Para cantidades de stock o números enteros.
* **`AppInputMoney`**: Entrada de valores monetarios con formato USD.
* **`AppDatePicker`**: Selector de fechas formateado en `DD/MM/AAAA` con soporte para horas de evento.

---

## 📝 Patrón de Validación de Formularios (VeeValidate & Yup)

Toda la lógica de validación se encapsula en el **Composable** del módulo y se conecta con la vista a través de `provide/inject`.

### 1. Definición en el Composable (`useMiModulo.ts`)
```typescript
import { useForm } from 'vee-validate';
import * as yup from 'yup';

export function useMiModulo() {
  const {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useForm({
    validationSchema: yup.object({
      name: yup.string().required('El nombre es requerido').min(3),
      price: yup.number().required('El precio es requerido').min(0.01),
    }),
  });

  const [name, nameAttrs] = defineField('name');
  const [price, priceAttrs] = defineField('price');

  const createItem = async (form: any) => { /* axios request */ };

  return {
    errors,
    name,
    nameAttrs,
    price,
    priceAttrs,
    handleSubmit,
    createItem,
    resetForm,
  };
}
```

### 2. Conexión en el Modal Formulario (`MiModuloFormModal.vue`)
```vue
<template>
  <AppModal :show="show" @confirm-modal="onSubMit">
    <AppInputText v-model="name" :error-messages="errors.name" v-bind="nameAttrs" label="Nombre" />
    <AppInputMoney v-model="price" :error-messages="errors.price" v-bind="priceAttrs" label="Precio" />
  </AppModal>
</template>

<script setup lang="ts">
import { inject } from 'vue';
const { errors, name, nameAttrs, price, priceAttrs, handleSubmit, createItem } = inject('useMiModulo');

const onSubMit = handleSubmit(async (values) => {
  await createItem(values);
});
</script>
```

---

## 📡 Capa de Servicios HTTP (Axios)

Toda comunicación hacia la API backend debe pasar por `httpClient` (`src/core/utils/httpClient`). No se debe importar Axios directamente en los componentes o composables.

```typescript
import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';

const getProducts = async (params?: any): Promise<ApiResponseGeneric<ProductResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<ProductResponse>>('inventory/products', params);
  return response.data;
};
```

---

## 🔑 Menús y Permisos Dinámicos

Las opciones que un usuario visualiza en la barra de navegación lateral y superior se controlan dinámicamente desde el backend.
1. Al iniciar sesión, el endpoint de autenticación retorna un árbol de menús (`menu.data.menus`) asignados al rol del usuario.
2. Estos menús se guardan en el store `useAuthStore` bajo la propiedad `menu`.
3. El componente `AppHeader.vue` lee esta propiedad de forma computada y emite la información para que `Layout.vue` renderice el sidebar dinámico mediante `AppSideBar.vue`.
4. Las rutas del frontend deben coincidir exactamente con los paths/URIs declarados en la base de datos de permisos del backend para permitir el acceso correcto.
