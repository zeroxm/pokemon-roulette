import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { EventSource } from '../../../EventSource';
import { AdventureAction, AdventureActionName, adventureActionsFor } from './adventure-actions';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-adventure-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './main-adventure-roulette.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-adventure-roulette.component.css'
})
export class MainAdventureRouletteComponent implements OnInit, OnDestroy {

  constructor(private generationService: GenerationService) {
  }

  @Input() respinReason!: string;
  @Input() respinReasonParams: Record<string, unknown> = {};
  @Output() catchPokemonEvent = new EventEmitter<void>();
  @Output() battleTrainerEvent = new EventEmitter<EventSource>();
  @Output() buyPotionsEvent = new EventEmitter<void>();
  @Output() doNothingEvent = new EventEmitter<void>();
  @Output() catchTwoPokemonEvent = new EventEmitter<void>();
  @Output() visitDaycareEvent = new EventEmitter<EventSource>();
  @Output() teamRocketEncounterEvent = new EventEmitter<void>();
  @Output() mysteriousEggEvent = new EventEmitter<void>();
  @Output() legendaryEncounterEvent = new EventEmitter<void>();
  @Output() tradePokemonEvent = new EventEmitter<void>();
  @Output() findItemEvent = new EventEmitter<void>();
  @Output() exploreCaveEvent = new EventEmitter<void>();
  @Output() snorlaxEncounterEvent = new EventEmitter<void>();
  @Output() multitaskEvent = new EventEmitter<void>();
  @Output() goFishingEvent = new EventEmitter<void>();
  @Output() findFossilEvent = new EventEmitter<void>();
  @Output() battleRivalEvent = new EventEmitter<void>();
  @Output() areaZeroEvent = new EventEmitter<void>();
  @Output() safariZoneEvent = new EventEmitter<void>();

  /**
   * Mutable on purpose: `WheelComponent`'s `items` input is `WheelItem[]`, and a readonly array
   * will not bind to it under `strictTemplates`.
   */
  actions: AdventureAction[] = adventureActionsFor(1);

  /**
   * What each slice does. Keyed by name rather than by wheel index, so a slice that only exists in
   * some regions cannot change what a given index means elsewhere.
   *
   * `Record<AdventureActionName, …>` is exhaustive: adding a row to `ADVENTURE_ACTIONS` without a
   * handler here is a compile error, and so is a handler for a row that no longer exists.
   */
  private readonly handlers: Record<AdventureActionName, () => void> = {
    catchPokemon: () => this.catchPokemonEvent.emit(),
    battleTrainer: () => this.battleTrainerEvent.emit('battle-trainer'),
    buyPotions: () => this.buyPotionsEvent.emit(),
    goStraight: () => this.doNothingEvent.emit(),
    catchTwoPokemon: () => this.catchTwoPokemonEvent.emit(),
    visitDaycare: () => this.visitDaycareEvent.emit('visit-daycare'),
    teamRocket: () => this.teamRocketEncounterEvent.emit(),
    mysteriousEgg: () => this.mysteriousEggEvent.emit(),
    legendaryEncounter: () => this.legendaryEncounterEvent.emit(),
    tradePokemon: () => this.tradePokemonEvent.emit(),
    findItem: () => this.findItemEvent.emit(),
    exploreCave: () => this.exploreCaveEvent.emit(),
    snorlaxEncounter: () => this.snorlaxEncounterEvent.emit(),
    multitask: () => this.multitaskEvent.emit(),
    goFishing: () => this.goFishingEvent.emit(),
    findFossil: () => this.findFossilEvent.emit(),
    battleRival: () => this.battleRivalEvent.emit(),
    safariZone: () => this.safariZoneEvent.emit(),
    areaZero: () => this.areaZeroEvent.emit(),
  };

  private generationSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.generationSubscription = this.generationService.getGeneration().subscribe(generation => {
      this.actions = adventureActionsFor(generation.id);
    });
  }

  ngOnDestroy(): void {
    this.generationSubscription?.unsubscribe();
  }

  onItemSelected(index: number): void {
    this.handlers[this.actions[index].name]();
  }
}
