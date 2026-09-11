import { Routes } from '@angular/router';
import { MainGameComponent } from './main-game/main-game.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreditsComponent } from './credits/credits.component';
import { CoffeeComponent } from './coffee/coffee.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountComponent } from './account/account.component';

export const routes: Routes = [
    { path: '', component: MainGameComponent },
    { path: 'credits', component: CreditsComponent },
    { path: 'coffee', component: CoffeeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'account', component: AccountComponent },
    { path: '**', component: NotFoundComponent },
];
