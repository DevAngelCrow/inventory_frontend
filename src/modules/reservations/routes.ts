export const routesReservations = [
  {
    path: '/reservations/list',
    name: 'reservations-list',
    component: () => import('@/modules/reservations/views/Reservations.vue'),
  },
  {
    path: '/reservations/detail/:id?',
    name: 'reservation-detail',
    component: () =>
      import('@/modules/reservations/views/ReservationDetail.vue'),
  },
  {
    path: '/reservations/calendar',
    name: 'reservations-calendar',
    component: () => import('@/modules/reservations/views/CalendarView.vue'),
  },
];
