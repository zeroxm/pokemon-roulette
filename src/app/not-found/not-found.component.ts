import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MainGameButtonComponent } from '../main-game-button/main-game-button.component';

@Component({
  selector: 'app-not-found',
  imports: [TranslatePipe, MainGameButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {

}
