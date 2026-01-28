import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import {enableProdMode} from "@angular/core";
import {environment} from "./environments/environment";

// Register Swiper custom elements. We do this
// before bootstrapping the Angular application
// so that they're available before any part of
// our application tries rendering them.
registerSwiperElements();

// Create temporary loader element

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

if (environment.production) {
  enableProdMode();
  // Disable all console methods
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
  window.console.info = () => {};
}
