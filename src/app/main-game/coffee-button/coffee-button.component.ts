import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-coffee-button',
  imports: [
    NgIconsModule
  ],
  templateUrl: './coffee-button.component.html',
  styleUrl: './coffee-button.component.css'
})
export class CoffeeButtonComponent {

  constructor(private router: Router) {}

  goToCoffee(): void {
    this.router.navigate(['coffee']);
  }
}
