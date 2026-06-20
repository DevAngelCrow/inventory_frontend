<template>
  <AppTitle title="Dashboard de Alquileres" />
  <div class="w-full md:px-16 flex flex-col gap-6 pb-10">
    <Card class="w-full">
      <template #content>
        <div class="flex gap-5 flex-wrap">
          <Button
            v-for="(item, index) in botonera"
            :key="index"
            outlined
            :icon="item.icon"
            :label="item.label"
            class="w-[200px] grow"
            @click="$router.push({ name: item.routeName })"
          />
        </div>
      </template>
    </Card>
    
    <section id="card_section" class="flex flex-col gap-6 flex-wrap">
      <div class="flex justify-between flex-row flex-wrap w-full xs:gap-5 gap-y-5">
        <!-- Card: Reservas -->
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1 class="text-lg">Reservas (Confirmadas)</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row mt-2">
              <div class="flex justify-start flex-col gap-2 text-surface-500 font-medium">
                <span>Hoy</span>
                <span>Semana</span>
                <span>Mes</span>
              </div>
              <div class="flex justify-end flex-col gap-2 font-semibold">
                <span>{{ metricas?.reservas.hoy || 0 }}</span>
                <span>{{ metricas?.reservas.semana || 0 }}</span>
                <span>{{ metricas?.reservas.mes || 0 }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Card: Ingresos -->
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1 class="text-lg">Ingresos</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row mt-2">
              <div class="flex justify-start flex-col gap-2 text-surface-500 font-medium">
                <span>Hoy</span>
                <span>Semana</span>
                <span>Mes</span>
              </div>
              <div class="flex justify-end flex-col gap-2 font-semibold">
                <span>${{ metricas?.ingresos.hoy.toFixed(2) || '0.00' }}</span>
                <span>${{ metricas?.ingresos.semana.toFixed(2) || '0.00' }}</span>
                <span>${{ metricas?.ingresos.mes.toFixed(2) || '0.00' }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Card: Inventario -->
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1 class="text-lg">Inventario / Logística</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row mt-2">
              <div class="flex justify-start flex-col gap-2 text-surface-500 font-medium">
                <span>En Tránsito</span>
                <span>Entregados</span>
                <span>En Mantenimiento</span>
              </div>
              <div class="flex justify-end flex-col gap-2 font-semibold">
                <span>{{ metricas?.logistica.en_transito || 0 }}</span>
                <span>{{ metricas?.logistica.entregados || 0 }}</span>
                <span>{{ metricas?.logistica.en_mantenimiento || 0 }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Card: Balance -->
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1 class="text-lg">Cuentas por Cobrar</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row mt-2">
              <div class="flex justify-start flex-col gap-2 text-surface-500 font-medium">
                <span>Balance Pendiente</span>
                <span>Facturas DRAFT</span>
              </div>
              <div class="flex justify-end flex-col gap-2 font-semibold">
                <span class="text-orange-500">${{ metricas?.cuentas_por_cobrar.balance_pendiente.toFixed(2) || '0.00' }}</span>
                <span>{{ metricas?.cuentas_por_cobrar.facturas_draft || 0 }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="flex justify-between flex-row gap-5 flex-wrap">
        <Card class="w-[49%] grow">
          <template #title>
            <h1 class="text-lg">Top Productos Más Rentados</h1>
          </template>
          <template #content>
            <div class="mt-2">
              <ul class="flex flex-col gap-3">
                <li v-for="(prod, i) in metricas?.top_productos" :key="i" class="flex justify-between items-center border-b pb-2 last:border-0">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {{ i + 1 }}
                    </div>
                    <span>{{ prod.nombre }}</span>
                  </div>
                  <span class="font-semibold">{{ prod.cantidad }} alquilados</span>
                </li>
                <li v-if="!metricas?.top_productos?.length" class="text-surface-500 italic">No hay datos suficientes</li>
              </ul>
            </div>
          </template>
        </Card>
        
        <Card class="w-[49%] grow">
          <template #title>
            <h1 class="text-lg">Próximos Eventos (Hoy y Mañana)</h1>
          </template>
          <template #content>
            <div class="mt-2">
              <ul class="flex flex-col gap-3">
                <li v-for="(ev, i) in metricas?.proximos_eventos" :key="i" class="flex justify-between border-b pb-2 last:border-0">
                  <div class="flex flex-col">
                    <span class="font-medium text-primary">{{ ev.cliente }}</span>
                    <span class="text-sm text-surface-500">{{ ev.direccion }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="font-semibold">{{ ev.fecha }}</span>
                    <span class="text-sm border rounded px-2 py-0.5" :class="ev.tipo === 'ENTREGA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">{{ ev.tipo }}</span>
                  </div>
                </li>
                <li v-if="!metricas?.proximos_eventos?.length" class="text-surface-500 italic">No hay eventos próximos programados</li>
              </ul>
            </div>
          </template>
        </Card>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { Card, Button } from 'primevue';
import { ref, onMounted } from 'vue';
import AppTitle from '@/core/components/AppTitle.vue';

// Mock data para el dashboard - eventualmente vendrá de report.services.ts
const metricas = ref({
  reservas: { hoy: 2, semana: 15, mes: 45 },
  ingresos: { hoy: 350.00, semana: 2150.50, mes: 8400.00 },
  logistica: { en_transito: 3, entregados: 8, en_mantenimiento: 12 },
  cuentas_por_cobrar: { balance_pendiente: 1250.00, facturas_draft: 5 },
  top_productos: [
    { nombre: 'Silla Plegable Blanca', cantidad: 450 },
    { nombre: 'Mesa Rectangular 6ft', cantidad: 120 },
    { nombre: 'Canopy 10x10', cantidad: 15 },
    { nombre: 'Mantel Blanco Redondo', cantidad: 80 }
  ],
  proximos_eventos: [
    { cliente: 'María López (Boda)', direccion: '123 Main St, Local A', fecha: 'Hoy 14:00', tipo: 'ENTREGA' },
    { cliente: 'Empresa XYZ', direccion: 'Av. Corporativa 400', fecha: 'Mañana 09:00', tipo: 'RECOLECCION' }
  ]
});

const botonera = ref([
  {
    icon: 'pi pi-calendar-plus',
    label: 'Nueva Reserva',
    routeName: 'reservations',
  },
  {
    icon: 'pi pi-users',
    label: 'Clientes',
    routeName: 'customers',
  },
  {
    icon: 'pi pi-box',
    label: 'Inventario',
    routeName: 'inventory-products',
  },
  {
    icon: 'pi pi-file-invoice',
    label: 'Facturación',
    routeName: 'billing-invoices',
  },
]);

onMounted(() => {
  // Aquí se haría el fetch al backend: const response = await reportService.getDashboardSummary()
});
</script>
