import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { legendaryByGeneration } from './legendaries-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-legendary-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './legendary-roulette.component.html',
  styleUrl: './legendary-roulette.component.css'
})
export class LegendaryRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) {
  }

  legendaryByGeneration = legendaryByGeneration;

  generation!: GenerationItem;
  @Output() selectedPokemonEvent = new EventEmitter<PokemonItem>();

  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const legendary = this.getFromGeneration();
    const selectedPokemon = legendary[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.legendaryByGeneration[this.generation.id];
  }
}
