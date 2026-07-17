export const routesInventory = [
  {
    path: 'inventory/categories',
    name: 'inventory-categories',
    component: () => import('@/modules/inventory/views/ProductCategories.vue'),
  },
  {
    path: 'inventory/products',
    name: 'inventory-products',
    component: () => import('@/modules/inventory/views/Products.vue'),
  },
  {
    path: 'inventory/maintenance',
    name: 'inventory-maintenance',
    component: () => import('@/modules/inventory/views/ProductMaintenance.vue'),
  },
  {
    path: 'inventory/measurement-units',
    name: 'inventory-measurement-units',
    component: () => import('@/modules/inventory/views/MeasurementUnits.vue'),
  },
];
