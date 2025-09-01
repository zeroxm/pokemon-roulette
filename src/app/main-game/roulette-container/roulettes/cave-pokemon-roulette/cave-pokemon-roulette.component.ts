import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { cavePokemonByGeneration } from './cave-pokemon-by-generation';
import { Subscription } from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-cave-pokemon-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './cave-pokemon-roulette.component.html',
  styleUrl: './cave-pokemon-roulette.component.css'
})
export class CavePokemonRouletteComponent implements OnInit, OnDestroy {


  constructor(private generationService: GenerationService) {
  }

  cavePokemonByGeneration = cavePokemonByGeneration;

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
    return this.cavePokemonByGeneration[this.generation.id];
  }
}
