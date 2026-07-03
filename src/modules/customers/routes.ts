export const routesCustomers = [
  {
    path: '/customers/list',
    name: 'customers-list',
    component: () => import('@/modules/customers/views/Customers.vue'),
  },
];
