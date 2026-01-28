import {APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {AuthInterceptor} from "./core/interceptors/request.interceptor";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {provideAnimations} from "@angular/platform-browser/animations";
import {sessionInterceptor} from "./core/interceptors/session.interceptor";
import {SessionService} from "./core/services/session/session.service";
import {LoaderService} from "./core/services/loader/loader.service";
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled'
    })),
    // provideAnimationsAsync(),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([sessionInterceptor,AuthInterceptor]),
    ), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (session: SessionService) =>
    //     () => session.getSession().toPromise(),
    //   deps: [SessionService],
    //   multi: true
    // }
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (session: SessionService, loader: LoaderService) => {
    //     return () => {
    //       loader.show();
    //       return session.getSession().toPromise()
    //         .finally(() => loader.hide());
    //     };
    //   },
    //   deps: [SessionService, LoaderService],
    //   multi: true
    // }
  ]
};
