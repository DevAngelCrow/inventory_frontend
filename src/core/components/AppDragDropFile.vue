<template>
  <FileUpload
    name="dragdrop"
    :multiple="multiple"
    :accept="accept"
    @select="onSelectedFiles"
    :pt="{
      root: {
        class: errorMessagesClass,
      },
    }"
    :ptOptions="{ mergeProps: true }"
  >
    <template #header="{ chooseCallback, clearCallback, files }">
      <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
        <div class="flex gap-2">
          <Button
            @click="chooseCallback()"
            icon="pi pi-images"
            rounded
            variant="outlined"
            severity="secondary"
          ></Button>

          <Button
            @click="onClearFiles(clearCallback)"
            icon="pi pi-times"
            rounded
            variant="outlined"
            severity="danger"
            :disabled="!files || files.length === 0"
          ></Button>
        </div>

        <ProgressBar
          :value="totalSizePercent"
          :showValue="false"
          class="md:w-20rem h-1 w-full md:ml-auto"
        >
          <span class="whitespace-nowrap">{{ formatSize(totalSize) }} / {{ formatSize(maxSize) }}</span>
        </ProgressBar>
      </div>
    </template>

    <template
      #content="{
        uploadedFiles,

        removeUploadedFileCallback,

        removeFileCallback,
      }"
    >
      <div class="flex flex-col justify-center items-center gap-8 pt-4">
        <div v-if="files.length > 0">
          <h5>Cargado</h5>

          <div class="flex flex-wrap gap-4">
            <template v-if="multiple">
              <div
                v-for="(file, index) of files"
                :key="file.name + file.type + file.size"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                </div>

                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  >{{ file.name }}</span
                >

                <div>{{ formatSize(file.size) }}</div>

                <Badge value="Cargado" severity="success" />

                <Button
                  icon="pi pi-times"
                  @click="
                    onRemoveTemplatingFile(file, removeFileCallback, index)
                  "
                  variant="outlined"
                  rounded
                  severity="danger"
                />
              </div>
            </template>

            <template v-else>
              <div
                v-if="files[0] && headerFiles[0]"
                class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
              >
                <img
                  role="presentation"
                  :alt="headerFiles[0].name"
                  :src="headerFiles[0].objectURL"
                  width="100"
                  height="50"
                />

                <span class="font-semibold">{{ files[0].name }}</span>

                <div>{{ formatSize(files[0].size) }}</div>

                <Badge value="Cargado" severity="success" />

                <Button
                  icon="pi pi-times"
                  @click="
                    onRemoveTemplatingFile(files[0], removeFileCallback, 0)
                  "
                  variant="outlined"
                  rounded
                  severity="danger"
                />
              </div>
            </template>
          </div>
        </div>

        <div v-if="uploadedFiles.length > 0">
          <h5>Completado</h5>

          <div class="flex flex-wrap gap-4">
            <div
              v-for="(file, index) of uploadedFiles"
              :key="file.name + file.type + file.size"
              class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
            >
              <div>
                <img
                  role="presentation"
                  :alt="file.name"
                  :src="(file as PrimeVueFile).objectURL"
                  width="100"
                  height="50"
                />
              </div>

              <span
                class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                >{{ file.name }}</span
              >

              <div>{{ formatSize(file.size) }}</div>

              <Badge value="Completed" class="mt-4" severity="success" />

              <Button
                icon="pi pi-times"
                @click="removeUploadedFileCallback(index)"
                variant="outlined"
                rounded
                severity="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #empty>
      <div class="flex items-center justify-center flex-col">
        <i
          class="pi pi-cloud-upload !border-2 !rounded-full !p-8 !text-4xl !text-muted-color"
        />

        <p class="mt-6 mb-0 text-center">
          {{
            multiple
              ? 'Arrastre y suelte archivos aquí para cargarlos.'
              : 'Arrastre y suelte la foto de perfil aquí para cargarla'
          }}
        </p>
        
        <div class="mt-2 text-sm text-muted-color text-center space-y-1">
          <p v-if="showFormats" class="mb-1">
            <strong>Formatos:</strong> {{ acceptedFormatsMessage }}
          </p>
          <p v-if="showMaxSize" class="mb-1">
            <strong>Tamaño máximo:</strong> {{ formatSize(maxSize) }}
          </p>
          <p v-if="maxDimensions" class="mb-0">
            <strong>Dimensiones máximas:</strong> {{ maxDimensions }}
          </p>
        </div>
      </div>
    </template>
  </FileUpload>

  <Message
    class="left-0 top-full mt-0 text-xs z-10"
    v-if="errorMessages.length || errors.length"
    :severity
    :size
    :variant
    >{{ messageErrorField }}</Message
  >
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePrimeVue } from 'primevue';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import ProgressBar from 'primevue/progressbar';
import Badge from 'primevue/badge';
import Message from 'primevue/message';

import type { PrimeVueFile } from '@/types/PrimeVueFile';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  multiple: {
    type: Boolean,

    default: false,
  },

  accept: {
    type: String,

    default: 'image/*',
  },

  modelValue: {
    type: Array as () => PrimeVueFile[],
    default: () => [],
  },

  errorMessages: {
    type: String,
    default: '',
  },

  severity: {
    type: String,

    default: 'error',
  },

  size: {
    type: String,

    default: 'small',
  },

  variant: {
    type: String,

    default: 'simple',
  },

  maxSize: {
    type: Number,
    default: 1048576, // 1MB en bytes
  },

  maxDimensions: {
    type: String,
    default: '', // Ejemplo: "1920x1080"
  },

  showFormats: {
    type: Boolean,
    default: true,
  },

  showMaxSize: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: PrimeVueFile[]): void;
}>();

const $primevue = usePrimeVue();

const totalSize = ref<number>(0);

const totalSizePercent = ref<number>(0);

const errors = ref<string>('');

//const files = ref<PrimeVueFile[]>([]);

const files = computed<PrimeVueFile[]>({
  get: () => props.modelValue,

  set: val => emit('update:modelValue', val),
});

const onClearFiles = (clearCallback: () => void) => {
  clearCallback();

  files.value = [];

  totalSize.value = 0;

  totalSizePercent.value = 0;

  errors.value = '';
};

const uploadEvent = (callback: () => void) => {
  totalSizePercent.value = 100;

  callback();
};

const onRemoveTemplatingFile = (
  file: PrimeVueFile,

  removeFileCallback: (_index: number) => void,

  _index: number,
) => {
  const fileIndexToRemove = files.value.findIndex(f => f === file);

  if (fileIndexToRemove === -1) return;

  totalSize.value -= file.size;

  removeFileCallback(fileIndexToRemove);

  const newFiles = [...files.value];

  newFiles.splice(fileIndexToRemove, 1);

  files.value = newFiles;

  totalSizePercent.value =
    totalSize.value > 0 ? (totalSize.value / props.maxSize) * 100 : 0;
};

const validateFileType = (file: File | undefined | null, accept: string): boolean => {
  // Validar que el archivo existe
  if (!file) return false;
  
  if (!accept || accept === '*/*') return true;

  const acceptedTypes = accept.split(',').map(type => type.trim());

  return acceptedTypes.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      // Extension-based validation
      return file.name?.toLowerCase().endsWith(acceptedType.toLowerCase()) || false;
    } else if (acceptedType.endsWith('/*')) {
      // MIME type wildcard (e.g., "image/*")
      const baseType = acceptedType.split('/')[0];
      return file.type?.startsWith(baseType + '/') || false;
    } else {
      // Exact MIME type match
      return file.type === acceptedType;
    }
  });
};

const onSelectedFiles = (event: FileUploadSelectEvent) => {
  const selectedFiles = (
    props.multiple ? event.files : [event.files[0]]
  ) as PrimeVueFile[];

  // Primero filtrar archivos válidos (no undefined o null)
  const validFiles = selectedFiles.filter(file => file !== undefined && file !== null);

  if (validFiles.length === 0) {
    errors.value = 'No se pudieron cargar los archivos seleccionados';
    return;
  }

  // Validar tipos de archivo
  const invalidFiles = validFiles.filter(
    file => !validateFileType(file, props.accept)
  );

  if (invalidFiles.length > 0) {
    const fileNames = invalidFiles.map(f => f.name || 'archivo desconocido').join(', ');
    const fileTypes = invalidFiles.map(f => f.type || 'tipo desconocido').join(', ');
    errors.value = `Tipo de archivo no permitido: ${fileTypes}. Archivos: ${fileNames}. Solo se aceptan: ${props.accept}`;
    return;
  }

  // Validar tamaño de archivo
  const oversizedFiles = validFiles.filter(
    file => file.size > props.maxSize
  );

  if (oversizedFiles.length > 0) {
    const fileNames = oversizedFiles.map(f => f.name || 'archivo desconocido').join(', ');
    const fileSizes = oversizedFiles.map(f => formatSize(f.size)).join(', ');
    errors.value = `Archivo(s) demasiado grande(s): ${fileNames} (${fileSizes}). Tamaño máximo permitido: ${formatSize(props.maxSize)}`;
    return;
  }

  // Limpiar errores si los archivos son válidos
  errors.value = '';

  if (props.multiple) {
    files.value = [...files.value, ...validFiles];
  } else {
    files.value = validFiles;
  }

  totalSize.value = files.value.reduce((acc, file) => acc + file.size, 0);

  totalSizePercent.value = (totalSize.value / props.maxSize) * 100;

  uploadEvent(() => {});
};

const formatSize = (bytes: number): string => {
  const k = 1024;

  const dm = 3;

  const defaultSizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const sizes = $primevue.config.locale?.fileSizeTypes || defaultSizes;

  if (bytes === 0) return `0 ${sizes[0]}`;

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const headerFiles = computed<PrimeVueFile[]>(() =>
  files.value.map(f => f as PrimeVueFile),
);

const errorMessagesClass = computed(() => {
  if (props.errorMessages.length || errors.value.length) {
    return 'border-red-600';
  }
  return '';
});

const messageErrorField = computed(() => {
  // Priorizar errores del prop sobre errores internos
  if (props.errorMessages.length) {
    return props.errorMessages;
  }
  return errors.value;
});

const acceptedFormatsMessage = computed(() => {
  if (!props.accept || props.accept === '*/*') {
    return 'Todos los formatos';
  }

  const acceptedTypes = props.accept.split(',').map(type => type.trim());
  const formats: string[] = [];

  acceptedTypes.forEach(type => {
    if (type.startsWith('.')) {
      // Extension-based (e.g., ".pdf", ".docx")
      formats.push(type.toUpperCase().replace('.', ''));
    } else if (type.endsWith('/*')) {
      // MIME type wildcard (e.g., "image/*", "video/*")
      const baseType = type.split('/')[0];
      const typeNames: Record<string, string> = {
        'image': 'Imágenes (JPG, PNG, GIF, etc.)',
        'video': 'Videos (MP4, AVI, etc.)',
        'audio': 'Audio (MP3, WAV, etc.)',
        'application': 'Documentos'
      };
      formats.push(typeNames[baseType] || baseType.toUpperCase());
    } else {
      // Exact MIME type (e.g., "application/pdf")
      const extension = type.split('/')[1]?.toUpperCase();
      if (extension) {
        formats.push(extension);
      }
    }
  });

  return formats.length > 0 ? formats.join(', ') : 'Formatos específicos';
});
</script>

<style scoped></style>
