import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { starterByGeneration } from './starter-by-generation';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

@Component({
  selector: 'app-starter-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './starter-roulette.component.html',
  styleUrl: './starter-roulette.component.css'
})
export class StarterRouletteComponent implements OnInit, OnDestroy {

  constructor(
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) { }

  startersByGeneration = starterByGeneration;
  private generationSubscription!: Subscription;

  generation!: GenerationItem;
  starters: PokemonItem[] = [];
  @Output() selectedStarterEvent = new EventEmitter<PokemonItem>();

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(gen => {
      this.generation = gen;
      const starterIds = this.startersByGeneration[this.generation.id] ?? [];
      this.starters = this.pokemonService.getPokemonByIdArray(starterIds);
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    const selectedStarter = this.starters[index];
    this.selectedStarterEvent.emit(selectedStarter);
  }
}
