import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { starterByGeneration } from './starter-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-starter-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './starter-roulette.component.html',
  styleUrl: './starter-roulette.component.css'
})
export class StarterRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) { }

  startersByGeneration = starterByGeneration;
  private generationSubscription!: Subscription;

  generation!: GenerationItem;
  @Output() selectedStarterEvent = new EventEmitter<PokemonItem>();

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  getStarters(): PokemonItem[] {
    return this.startersByGeneration[this.generation.id];
  }

  onItemSelected(index: number): void {
    const starters = this.getStarters();
    const selectedStarter = starters[index];
    this.selectedStarterEvent.emit(selectedStarter);
  }
}
