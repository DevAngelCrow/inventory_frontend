<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="calendar_view_content"
      class="w-full xl:w-[90%] flex flex-col gap-6"
    >
      <AppTitle title="Agenda de Entregas y Eventos" />

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Calendar Picker Card (Left) -->
        <Card class="lg:col-span-1">
          <template #title>
            <h3>Seleccionar Fecha</h3>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <DatePicker v-model="selectedDate" inline class="w-full" />
              <div class="mt-4 flex flex-col gap-2">
                <span class="text-sm font-semibold">Indicadores:</span>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-3 h-3 rounded-full bg-green-500 block"></span>
                  <span>Entrega de Equipamiento</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-3 h-3 rounded-full bg-blue-500 block"></span>
                  <span>Evento en Curso</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="w-3 h-3 rounded-full bg-purple-500 block"></span>
                  <span>Recolección / Retorno</span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Events Agenda Timeline (Right) -->
        <Card class="lg:col-span-3">
          <template #title>
            <div class="flex justify-between items-center">
              <h3>Cronograma del Día: {{ agendaDateFormatted }}</h3>
              <Button label="Hoy" size="small" outlined @click="selectToday" />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-5">
              <div v-if="loadingAgenda" class="text-center py-10">
                <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
                <p class="mt-2 text-gray-500">Cargando agenda...</p>
              </div>

              <div v-else-if="!filteredAgendaItems.length" class="text-center py-10 text-gray-500">
                <i class="pi pi-calendar-minus text-4xl block mb-2 text-gray-300"></i>
                No hay actividades de alquiler programadas para esta fecha.
              </div>

              <div v-else class="flex flex-col gap-4">
                <div
                  v-for="(event, idx) in filteredAgendaItems"
                  :key="idx"
                  class="border-l-4 p-4 rounded-r-lg bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-200"
                  :class="getTimelineBorderClass(event.type)"
                >
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-semibold uppercase tracking-wider px-2 py-0.5 rounded text-white" :class="getTimelineBadgeClass(event.type)">
                        {{ getTimelineTypeLabel(event.type) }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ event.time }}
                      </span>
                    </div>
                    <span class="text-lg font-bold">{{ event.reservation.reservation_number }}</span>
                    <span class="text-sm text-gray-700">
                      <strong>Cliente:</strong> {{ event.reservation.mnt_customer?.first_name }} {{ event.reservation.mnt_customer?.last_name }}
                    </span>
                    <span class="text-xs text-gray-600" v-if="event.reservation.delivery_address">
                      <strong>Dirección:</strong> {{ event.reservation.delivery_address }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <Button icon="pi pi-eye" outlined rounded severity="secondary" size="small" @click="viewReservation(event.reservation.id)" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Card, DatePicker, Button } from 'primevue';
import dayjs from 'dayjs';

import AppTitle from '@/core/components/AppTitle.vue';
import reservationServices from '../Services/reservation.services';
import { ReservationResponse } from '../interfaces/reservation.interfaces';

const router = useRouter();
const selectedDate = ref<Date>(new Date());
const reservationsList = ref<ReservationResponse[]>([]);
const loadingAgenda = ref(false);

const agendaDateFormatted = computed(() => {
  return dayjs(selectedDate.value).format('DD [de] MMMM, YYYY');
});

const loadEvents = async () => {
  loadingAgenda.value = true;
  try {
    const start = dayjs(selectedDate.value).startOf('month').toISOString();
    const end = dayjs(selectedDate.value).endOf('month').toISOString();
    const resp = await reservationServices.getReservations({
      start_date: dayjs(selectedDate.value).startOf('month').format('DD/MM/YYYY'),
      end_date: dayjs(selectedDate.value).endOf('month').format('DD/MM/YYYY'),
      per_page: 100,
    });
    if (resp.statusCode === 200) {
      reservationsList.value = resp.data.data;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loadingAgenda.value = false;
  }
};

const selectToday = () => {
  selectedDate.value = new Date();
};

const viewReservation = (id: string) => {
  router.push({ name: 'reservation-detail', params: { id }, query: { mode: 'view' } });
};

// Compute deliveries, events, and pickups on the selected date
const filteredAgendaItems = computed(() => {
  const dateStr = dayjs(selectedDate.value).format('YYYY-MM-DD');
  const items: {
    type: 'delivery' | 'event' | 'pickup';
    time: string;
    reservation: ReservationResponse;
  }[] = [];

  reservationsList.value.forEach((res) => {
    // Deliveries
    if (res.delivery_datetime) {
      const delDate = dayjs(res.delivery_datetime);
      if (delDate.format('YYYY-MM-DD') === dateStr) {
        items.push({
          type: 'delivery',
          time: delDate.format('hh:mm a'),
          reservation: res,
        });
      }
    }

    // Events
    const eventStartDate = dayjs(res.event_start);
    if (eventStartDate.format('YYYY-MM-DD') === dateStr) {
      items.push({
        type: 'event',
        time: eventStartDate.format('hh:mm a'),
        reservation: res,
      });
    }

    // Pickups
    if (res.pickup_datetime) {
      const pickDate = dayjs(res.pickup_datetime);
      if (pickDate.format('YYYY-MM-DD') === dateStr) {
        items.push({
          type: 'pickup',
          time: pickDate.format('hh:mm a'),
          reservation: res,
        });
      }
    }
  });

  // Sort items by time
  return items.sort((a, b) => a.time.localeCompare(b.time));
});

const getTimelineBorderClass = (type: string) => {
  if (type === 'delivery') return 'border-green-500';
  if (type === 'event') return 'border-blue-500';
  return 'border-purple-500';
};

const getTimelineBadgeClass = (type: string) => {
  if (type === 'delivery') return 'bg-green-500';
  if (type === 'event') return 'bg-blue-500';
  return 'bg-purple-500';
};

const getTimelineTypeLabel = (type: string) => {
  if (type === 'delivery') return 'Entrega';
  if (type === 'event') return 'Evento';
  return 'Retorno';
};

watch(selectedDate, () => {
  loadEvents();
});

onMounted(() => {
  loadEvents();
});
</script>
