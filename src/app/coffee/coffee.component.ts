import { Component } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { DarkModeToggleComponent } from "../dark-mode-toggle/dark-mode-toggle.component";
import { MainGameButtonComponent } from "../main-game-button/main-game-button.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coffee',
  imports: [
    CommonModule,
    NgIconsModule,
    DarkModeToggleComponent,
    MainGameButtonComponent
],
  templateUrl: './coffee.component.html',
  styleUrl: './coffee.component.css'
})
export class CoffeeComponent {

  pixCodeCopied = false;

  copyPixCode(): void {
    const pixCode = '00020126570014br.gov.bcb.pix0114+55119810913460217Doacao PokeRoleta5204000053039865802BR5921ANDRE XAVIER MARTINEZ6009SAO PAULO62290525Sb3JYOo8cvZN5pvqYSxf3mEd863044CAA.gov.bcb.pix0114+55119810913460203Pix5204000053039865802BR5921ANDRE XAVIER MARTINEZ6009SAO PAULO62130509Pokegira26304B933';
    navigator.clipboard.writeText(pixCode).then(() => {
      console.log('Pix code copied to clipboard');
      this.pixCodeCopied = true;
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  }

}
