import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-credits-button',
  imports: [
    NgIconsModule,
  ],
  templateUrl: './credits-button.component.html',
  styleUrl: './credits-button.component.css'
})
export class CreditsButtonComponent {

  constructor(private router: Router) {}

  goToCredits(): void {
    this.router.navigate(['credits']);
  }
}
