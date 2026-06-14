import { App } from 'vue';

export function registerGlobalComponents(app: App) {
  const components = import.meta.glob<Record<string, { default: unknown }>>(
    '../components/**/*.vue',
    { eager: true },
  );

  Object.entries(components).forEach(([path, definition]) => {
    const fileName =
      path
        .split('/')
        .pop()
        ?.replace(/\.\w+$/, '') || '';
    if (!fileName) return;

    const pascalName = fileName;
    const kebabName = fileName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    app.component(pascalName, definition.default);
    app.component(kebabName, definition.default);
  });
}
