import { Component, Input } from '@angular/core';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { ItemItem } from '../interfaces/item-item';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-items',
  imports: [CommonModule,
            NgbTooltipModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent {

  @Input() trainerItems!: ItemItem[];

  darkMode!: Observable<boolean>; 

  constructor(private darkModeService: DarkModeService) {
    this.darkMode = this.darkModeService.darkMode$;
  }
}
