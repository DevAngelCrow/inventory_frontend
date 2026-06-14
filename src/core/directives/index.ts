import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import BadgeDirective from 'primevue/badgedirective';
import AnimateOnScrol from 'primevue/animateonscroll';
import StyleClass from 'primevue/styleclass';
import FocusTrap from 'primevue/focustrap';
import type { App } from 'vue';

import { debounceDirective } from './debounce';

export function registerDirectives(app: App) {
  app.directive('tooltip', Tooltip);
  app.directive('badge', BadgeDirective);
  app.directive('ripple', Ripple);
  app.directive('styleclass', StyleClass);
  app.directive('focustrap', FocusTrap);
  app.directive('animateonscroll', AnimateOnScrol);
  app.directive('debounce', debounceDirective);
}
