import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from '@ngx-translate/core';
import { WheelComponent } from '../../../../wheel/wheel.component';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { WheelItem } from '../../../../interfaces/wheel-item';

@Component({
  selector: 'app-team-rocket-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './team-rocket-roulette.component.html',
  styleUrl: './team-rocket-roulette.component.css'
})
export class TeamRocketRouletteComponent implements OnInit {

  constructor(private modalService: NgbModal) {
  }

  @Input() stolenPokemon!: PokemonItem | null;
  @Output() stealPokemonEvent = new EventEmitter<void>();
  @Output() nothingHappensEvent = new EventEmitter<void>();
  @Output() defeatInBattleEvent = new EventEmitter<void>();
  @ViewChild('teamRockerModal', { static: true }) teamRockerModal!: TemplateRef<any>;

  outcomes: WheelItem[] = [];

  jessie = {
    name: 'Jessie',
    sprite: 'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/SugimoriJessie.png',
  }

  james = {
    name: 'James',
    sprite: 'https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/SugimoriJames.png',
  }

  ngOnInit(): void {
    this.outcomes = [
      { text: 'They steal a Pokémon', fillStyle: 'crimson', weight: 2 },
      { text: 'You run away', fillStyle: 'darkorange', weight: 2 },
    ];

    if (this.stolenPokemon) {
      this.outcomes.push({ text: 'You defeat them', fillStyle: 'green', weight: 4 });
    } else {
      this.outcomes.push({ text: 'You defeat them', fillStyle: 'green', weight: 1 });
    }

    this.modalService.open(this.teamRockerModal, {
      centered: true,
      size: 'lg'
    });
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
