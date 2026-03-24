import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { WheelItem } from '../../../../interfaces/wheel-item';
import { TrainerService } from '../../../../services/trainer-service/trainer.service';

@Component({
  selector: 'app-team-rocket-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './team-rocket-roulette.component.html',
  styleUrl: './team-rocket-roulette.component.css'
})
export class TeamRocketRouletteComponent implements OnInit {

  constructor(
    private modalService: NgbModal,
    private trainerService: TrainerService
  ) {}

  @Input() stolenPokemon!: PokemonItem | null;
  @Output() stealPokemonEvent = new EventEmitter<void>();
  @Output() nothingHappensEvent = new EventEmitter<void>();
  @Output() defeatInBattleEvent = new EventEmitter<void>();
  @ViewChild('teamRockerModal', { static: true }) teamRockerModal!: TemplateRef<any>;

  // Phase 1: Fight/Flee/Negotiate
  phase1Items: WheelItem[] = [];
  // Phase 2: Original outcomes
  outcomes: WheelItem[] = [];
  phase: 1 | 2 = 1;
  stealWeightMultiplier = 1;

  jessie = {
    name: 'Jessie',
    sprite: 'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/SugimoriJessie.png',
  }

  james = {
    name: 'James',
    sprite: 'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/SugimoriJames.png',
  }

  ngOnInit(): void {
    const teamSize = this.trainerService.getTeam().length;

    // Phase 1 wheel
    this.phase1Items = [
      { text: 'game.main.roulette.teamrocket.phase1.fightBack', fillStyle: 'green', weight: teamSize + 1 },
      { text: 'game.main.roulette.teamrocket.phase1.flee', fillStyle: 'darkorange', weight: 2 },
      { text: 'game.main.roulette.teamrocket.phase1.negotiate', fillStyle: 'blue', weight: 1 },
    ];

    this.modalService.open(this.teamRockerModal, {
      centered: true,
      size: 'lg'
    });
  }

  private buildPhase2Outcomes(): void {
    this.outcomes = [
      { text: 'game.main.roulette.teamrocket.outcomes.steal', fillStyle: 'crimson', weight: 2 * this.stealWeightMultiplier },
      { text: 'game.main.roulette.teamrocket.outcomes.runAway', fillStyle: 'darkorange', weight: 2 },
    ];

    const teamSize = this.trainerService.getTeam().length;
    if (this.stolenPokemon) {
      this.outcomes.push({ text: 'game.main.roulette.teamrocket.outcomes.defeat', fillStyle: 'green', weight: 4 + teamSize });
    } else {
      this.outcomes.push({ text: 'game.main.roulette.teamrocket.outcomes.defeat', fillStyle: 'green', weight: 1 + teamSize });
    }
  }

  onPhase1Selected(index: number): void {
    switch (index) {
      case 0: // Fight Back -> go to phase 2 with normal steal weight
        this.stealWeightMultiplier = 1;
        this.buildPhase2Outcomes();
        this.phase = 2;
        break;
      case 1: // Flee -> escape, nothing happens
        this.nothingHappensEvent.emit();
        break;
      case 2: // Negotiate -> 50/50
        if (Math.random() < 0.5) {
          this.nothingHappensEvent.emit();
        } else {
          // Failed negotiation: phase 2 with doubled steal weight
          this.stealWeightMultiplier = 2;
          this.buildPhase2Outcomes();
          this.phase = 2;
        }
        break;
    }
  }

  onItemSelected(index: number): void {
    switch (index) {
      case 0:
        this.stealPokemonEvent.emit();
        break;
      case 1:
        this.nothingHappensEvent.emit();
        break;
      case 2:
        this.defeatInBattleEvent.emit();
        break;
    }
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}
