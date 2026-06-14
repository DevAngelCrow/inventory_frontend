export const routesAdmin = [
  {
    path: 'admin/category-permissions',
    name: 'category-permissions',
    component: () => import('@/modules/admin/views/CategoriesPermissions.vue'),
  },
  {
    path: 'admin/permissions',
    name: 'permissions',
    component: () => import('@/modules/admin/views/Permissions.vue'),
  },
  {
    path: 'admin/role',
    name: 'role',
    component: () => import('@/modules/admin/views/Role.vue'),
  },
  {
    path: 'admin/role/role-maintenance/:id?',
    name: 'role-maintenance',
    component: () => import('@/modules/admin/views/RolDetail.vue'),
  },
  {
    path: 'admin/routes-administration',
    name: 'routes-administration',
    component: () => import('@/modules/admin/views/Routes.vue'),
  },
  {
    path: 'admin/routes-administration/route-maintenance/:id?',
    name: 'route-maintenance',
    component: () => import('@/modules/admin/views/RouteDetail.vue'),
  },
  {
    path: 'admin/user-role',
    name: 'user-role',
    component: () => import('@/modules/admin/views/UserRole.vue'),
  },
];
