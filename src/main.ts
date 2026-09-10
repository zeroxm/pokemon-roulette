/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HANDOFF_RESULT } from './app/migration/handoff-result';
import { importHandoff } from './app/migration/import-handoff';

// Before bootstrap, deliberately: every service reads its slice of
// localStorage in its constructor, so a transfer applied any later would be
// writing underneath services that already decided the Pokédex was empty.
const handoff = importHandoff();

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...appConfig.providers, { provide: HANDOFF_RESULT, useValue: handoff }],
}).catch(err => console.error(err));
