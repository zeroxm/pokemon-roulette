import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fossilByGeneration } from './fossil-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-fossil-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './fossil-roulette.component.html',
  styleUrl: './fossil-roulette.component.css'
})
export class FossilRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) {
  }

  fossilByGeneration = fossilByGeneration;

  @Input() generation!: GenerationItem;
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
    const pokemon = this.getFromGeneration();
    const selectedPokemon = pokemon[index];
    this.selectedPokemonEvent.emit(selectedPokemon);
  }

  getFromGeneration(): PokemonItem[] {
    return this.fossilByGeneration[this.generation.id];
  }
}
