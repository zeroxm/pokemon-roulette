import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapArrowRepeat, bootstrapClock, bootstrapShare } from '@ng-icons/bootstrap-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIcons({ bootstrapArrowRepeat, bootstrapShare, bootstrapClock }),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true })]
};

