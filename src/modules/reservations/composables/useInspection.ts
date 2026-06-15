import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import * as yup from 'yup';

import { useAlertStore, useLoaderStore } from '@/core/store';
import { FormatDateToISO, FormatDate } from '@/core/utils/dates';
import { DamageItem, InspectionForm, ReservationResponse } from '../interfaces/reservation.interfaces';
import reservationServices from '../Services/reservation.services';

export function useInspection() {
  const {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
    values,
  } = useForm({
    validationSchema: yup.object({
      id_reservation: yup.string().required(),
      inspection_date: yup.string().required('La fecha de inspección es requerida'),
      general_notes: yup.string().nullable(),
      overall_condition: yup.string().required('La condición general es requerida'),
      status: yup.string().default('PENDING'),
    }),
  });

  const damageItems = ref<DamageItem[]>([]);
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id_reservation, idReservationAttrs] = defineField('id_reservation');
  const [inspection_date, inspectionDateAttrs] = defineField('inspection_date');
  const [general_notes, generalNotesAttrs] = defineField('general_notes');
  const [overall_condition, overallConditionAttrs] = defineField('overall_condition');
  const [status, statusAttrs] = defineField('status');

  const addDamageItem = (item: DamageItem) => {
    damageItems.value.push(item);
  };

  const removeDamageItem = (index: number) => {
    damageItems.value.splice(index, 1);
  };

  const clearDamageItems = () => {
    damageItems.value = [];
  };

  const totalCharges = computed(() => {
    return damageItems.value.reduce((sum, item) => sum + Number(item.charge_amount), 0);
  });

  const submitInspection = async (formValues: any) => {
    try {
      startLoading();
      const payload = {
        inspection_date: FormatDateToISO(formValues.inspection_date, 'DD/MM/YYYY') || '',
        general_notes: formValues.general_notes,
        overall_condition: formValues.overall_condition,
        status: formValues.status,
        damageItems: damageItems.value.map((item) => ({
          id_product: item.id_product,
          damage_type: item.damage_type,
          description: item.description,
          quantity_affected: Number(item.quantity_affected),
          charge_amount: Number(item.charge_amount),
        })),
      };

      const response = await reservationServices.registerInspection(formValues.id_reservation, payload);
      if (response.status === 201 || response.status === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Inspección registrada con éxito',
          show: true,
        });
        clearDamageItems();
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  return {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
    values,
    damageItems,
    addDamageItem,
    removeDamageItem,
    clearDamageItems,
    totalCharges,
    submitInspection,
    id_reservation,
    idReservationAttrs,
    inspection_date,
    inspectionDateAttrs,
    general_notes,
    generalNotesAttrs,
    overall_condition,
    overallConditionAttrs,
    status,
    statusAttrs,
  };
}
