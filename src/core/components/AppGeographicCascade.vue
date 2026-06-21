<template>
  <div class="w-full flex flex-col gap-4">
    <div v-for="(type, idx) in levels" :key="type.id" class="w-full">
      <AppAutocomplete
        class="w-full min-w-0"
        :id="`geo_cascade_${type.id}`"
        :label="type.name + (isRequired ? '*' : '')"
        v-model="selectedDivisions[idx]"
        :readonly="readonly"
        :disabled="readonly || (idx > 0 && !selectedDivisions[idx - 1])"
        :error-messages="idx === levels.length - 1 ? errorMessages : ''"
        option-label="name"
        :suggestions="divisionOptions[idx] || []"
        dropdown
        @complete="onComplete(idx, $event)"
        @update:modelValue="onDivisionSelect(idx, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import type { AutoCompleteCompleteEvent } from 'primevue';
import AppAutocomplete from '@/core/components/AppAutocomplete.vue';
import catalogServices from '@/modules/catalogs/Services/catalog.services';
import { GeographicDivisionTypeSimple } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.type.interface';
import { GeographicDivisionResponse } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.response.interface';

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  id_country: {
    type: String,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  errorMessages: {
    type: [String, Array],
    default: '',
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const levels = ref<GeographicDivisionTypeSimple[]>([]);
const selectedDivisions = ref<(GeographicDivisionResponse | null)[]>([]);
const divisionOptions = ref<GeographicDivisionResponse[][]>([]);

const loadConfig = async () => {
  if (!props.id_country) {
    levels.value = [];
    selectedDivisions.value = [];
    divisionOptions.value = [];
    return;
  }

  const res = await catalogServices.getAllGeographicDivisionTypes({
    id_country: props.id_country,
    active: true,
    per_page: 50,
  });

  if (res.statusCode === 200 && res.data?.data) {
    levels.value = res.data.data.sort((a, b) => a.level - b.level);
    // Initialize arrays
    selectedDivisions.value = new Array(levels.value.length).fill(null);
    divisionOptions.value = new Array(levels.value.length).fill([]);

    if (props.modelValue) {
      await loadLineage(props.modelValue);
    }
  }
};

const loadLineage = async (id_division: string) => {
  try {
    const res = await catalogServices.getGeographicDivisionLineage(id_division);
    if (res.statusCode === 200 && res.data) {
      const lineageIds = res.data; // e.g. [id_dept, id_muni]

      // For each level, fetch the division object to pre-fill
      for (let i = 0; i < levels.value.length; i++) {
        const divId = lineageIds[i];
        if (!divId) break;

        const divRes = await catalogServices.getGeographicDivisionById(divId);
        if (divRes.statusCode === 200 && divRes.data) {
          selectedDivisions.value[i] = divRes.data;
          // Optionally, pre-load options for this level
          await fetchOptions(i, '');
        }
      }
    }
  } catch (err) {
    console.error('Error loading lineage', err);
  }
};

const fetchOptions = async (levelIndex: number, query: string) => {
  const typeId = levels.value[levelIndex].id;
  const parentId = levelIndex > 0 ? selectedDivisions.value[levelIndex - 1]?.id : undefined;

  // Si es un nivel hijo pero no hay padre seleccionado, no se buscan opciones
  if (levelIndex > 0 && !parentId) {
    divisionOptions.value[levelIndex] = [];
    return;
  }

  try {
    const res = await catalogServices.getAllGeographicDivisions({
      id_country: props.id_country,
      id_type: typeId,
      id_parent: parentId || null,
      filter: query || undefined,
      active: true,
      per_page: 50,
    });

    if (res.statusCode === 200 && res.data?.data) {
      divisionOptions.value[levelIndex] = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching options', err);
  }
};

const onComplete = async (levelIndex: number, event: AutoCompleteCompleteEvent) => {
  await fetchOptions(levelIndex, event.query);
};

const onDivisionSelect = (levelIndex: number, newValue: GeographicDivisionResponse | string | null) => {
  // If the user clears the input, it might send a string or null
  const selectedObj = typeof newValue === 'string' ? null : newValue;
  selectedDivisions.value[levelIndex] = selectedObj;

  // Clear all downstream selections
  for (let i = levelIndex + 1; i < levels.value.length; i++) {
    selectedDivisions.value[i] = null;
    divisionOptions.value[i] = [];
  }

  emitUpdate();
};

const emitUpdate = () => {
  // Find the deepest selected division
  let deepestId: string | undefined = undefined;
  for (let i = levels.value.length - 1; i >= 0; i--) {
    if (selectedDivisions.value[i]?.id) {
      deepestId = selectedDivisions.value[i]?.id;
      break;
    }
  }
  emit('update:modelValue', deepestId);
};

onMounted(() => {
  loadConfig();
});

watch(
  () => props.id_country,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      loadConfig();
      emit('update:modelValue', undefined);
    }
  }
);

watch(
  () => props.modelValue,
  async (newVal) => {
    if (!newVal) {
      selectedDivisions.value.fill(null);
    } else {
      let deepestId: string | undefined = undefined;
      for (let i = levels.value.length - 1; i >= 0; i--) {
        if (selectedDivisions.value[i]?.id) {
          deepestId = selectedDivisions.value[i]?.id;
          break;
        }
      }
      if (deepestId !== newVal) {
        await loadLineage(newVal);
      }
    }
  }
);
</script>
