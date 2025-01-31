import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { WheelComponent } from "../../../wheel/wheel.component";
import { WheelItem } from '../../../interfaces/wheel-item';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-team-rocket-roulette',
  imports: [WheelComponent],
  templateUrl: './team-rocket-roulette.component.html',
  styleUrl: './team-rocket-roulette.component.css'
})
export class TeamRocketRouletteComponent implements OnInit {

  constructor(private modalService: NgbModal) {

  }

  @Output() stealPokemonEvent = new EventEmitter<void>();
  @Output() nothingHappensEvent = new EventEmitter<void>();
  @Output() defeatInBattleEvent = new EventEmitter<void>();
  @ViewChild('teamRockerModal', { static: true }) teamRockerModal!: TemplateRef<any>;

  outcomes: WheelItem[] = [
    { text: 'They steal a Pokémon', fillStyle: 'crimson', weight: 2 },
    { text: 'You run away', fillStyle: 'darkorange', weight: 2 },
    { text: 'You defeat them', fillStyle: 'green', weight: 1 }
  ];

  jessie = {
    name: 'Jessie',
    sprite: 'https://archives.bulbagarden.net/media/upload/3/3c/SugimoriJessie.png',
  }

  james = {
    name: 'James',
    sprite: 'https://archives.bulbagarden.net/media/upload/7/71/SugimoriJames.png',
  }

  ngOnInit(): void {
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
