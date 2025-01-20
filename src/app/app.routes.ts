import { Routes } from '@angular/router';
import { MainGameComponent } from './main-game/main-game.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: MainGameComponent },
    { path: '**', component: NotFoundComponent },
];
