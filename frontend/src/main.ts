/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // <-- hinzufügen
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(), // <-- hier HttpClient einfügen
    ...(appConfig.providers || []),
  ]
})
  .catch((err) => console.error(err));
