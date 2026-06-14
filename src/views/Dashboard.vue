<template>
  <AppTitle title="Facturación Electrónica" />
  <div class="w-full md:px-16 flex flex-col gap-6">
    <Card class="w-full">
      <template #content>
        <div class="flex gap-5 flex-wrap">
          <Button
            v-for="(item, index) in botonera"
            :key="index"
            outlined
            :icon="item.icon"
            :label="item.label"
            class="w-[300px] grow"
          />
        </div>
      </template>
    </Card>
    <section id="card_section" class="flex flex-col gap-6 flex-wrap">
      <div class="flex justify-between flex-row flex-wrap w-full xs:gap-5">
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1>Facturas emitidas</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Hoy</span>
                <span>Mes</span>
                <span>Año</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ facturaEmitidas?.hoy }}</span>
                <span>{{ facturaEmitidas?.mes }}</span>
                <span>{{ facturaEmitidas?.anio }}</span>
              </div>
            </div>
          </template>
        </Card>
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1>Montos totales</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Hoy</span>
                <span>Mes</span>
                <span>Año</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ montosTotales?.hoy }}</span>
                <span>{{ montosTotales?.mes }}</span>
                <span>{{ montosTotales?.anio }}</span>
              </div>
            </div>
          </template>
        </Card>
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1>Estado de los documentos</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Aceptados</span>
                <span>Pendientes</span>
                <span>Rechazados</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ estadoDocumentos?.aceptado }}</span>
                <span>{{ estadoDocumentos?.pendiente }}</span>
                <span>{{ estadoDocumentos?.rechazado }}</span>
              </div>
            </div>
          </template>
        </Card>
        <Card class="md:w-[23%] xs:w-full grow">
          <template #title>
            <h1>Clientes</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Hoy</span>
                <span>Mes</span>
                <span>Año</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ clientes?.hoy }}</span>
                <span>{{ clientes?.mes }}</span>
                <span>{{ clientes?.anio }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="flex justify-between flex-row gap-5 flex-wrap">
        <Card class="w-[49%] grow">
          <template #title>
            <h1>Tipos de documentos generados</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Factura electrónica</span>
                <span>Crédito Fiscal</span>
                <span>Nota de crédito</span>
                <span>Nota de débito</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ tiposDocumentos?.factura_electronica }}</span>
                <span>{{ tiposDocumentos?.credito_fiscal }}</span>
                <span>{{ tiposDocumentos?.nota_de_credito }}</span>
                <span>{{ tiposDocumentos?.nota_de_debito }}</span>
              </div>
            </div>
          </template>
        </Card>
        <Card class="w-[49%] grow">
          <template #title>
            <h1>Ventas recientes</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                Aqui debe ir una gráfica
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ tiposDocumentos?.factura_electronica }}</span>
                <span>{{ tiposDocumentos?.credito_fiscal }}</span>
                <span>{{ tiposDocumentos?.nota_de_credito }}</span>
                <span>{{ tiposDocumentos?.nota_de_debito }}</span>
              </div>
            </div>
          </template>
        </Card>
        <Card class="w-full">
          <template #title>
            <h1>Estado de conexión con Ministerio de Hacienda</h1>
          </template>
          <template #content>
            <div class="flex justify-between flex-row">
              <div class="flex justify-start flex-col">
                <span>Factura electrónica</span>
                <span>Crédito Fiscal</span>
                <span>Nota de crédito</span>
                <span>Nota de débito</span>
              </div>
              <div class="flex justify-end flex-col">
                <span>{{ tiposDocumentos?.factura_electronica }}</span>
                <span>{{ tiposDocumentos?.credito_fiscal }}</span>
                <span>{{ tiposDocumentos?.nota_de_credito }}</span>
                <span>{{ tiposDocumentos?.nota_de_debito }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { Card, Button } from 'primevue';
import { ref } from 'vue';

import type { EstadoDocumento } from './interfaces/estado-documentos.interface';
import { TiposDocumentos } from './interfaces/tipos-documentos-generados.interface';
import { TotalPorPeriodo } from './interfaces/total-por-periodo.interface';

const facturaEmitidas = ref<TotalPorPeriodo>();
const montosTotales = ref<TotalPorPeriodo>();
const clientes = ref<TotalPorPeriodo>();
const tiposDocumentos = ref<TiposDocumentos>();
const estadoDocumentos = ref<EstadoDocumento>();
const botonera = ref([
  {
    icon: 'pi pi-plus',
    label: 'Nueva factura',
  },
  {
    icon: 'pi pi-file',
    label: 'Historial de documentos',
  },
  {
    icon: 'pi pi-user',
    label: 'Clientes',
  },
]);
</script>
