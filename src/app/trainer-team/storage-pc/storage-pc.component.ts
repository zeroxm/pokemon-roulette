import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { GameStateService } from '../../services/game-state-service/game-state.service';
import { GameState } from '../../services/game-state-service/game-state';
import {TranslatePipe} from '@ngx-translate/core';
import { AudioService } from '../../services/audio-service/audio.service';

@Component({
  selector: 'app-storage-pc',
  imports: [
    DragDropModule,
    CommonModule,
    NgIconsModule,
    TranslatePipe
  ],
  templateUrl: './storage-pc.component.html',
  styleUrl: './storage-pc.component.css'
})
export class StoragePcComponent implements OnInit {

    constructor(private trainerService: TrainerService,
                private darkModeService: DarkModeService,
                private modalService: NgbModal,
                private gameStateService: GameStateService,
                private audioService: AudioService) {
      this.pcTurningOn = this.audioService.createAudio('./PCTurningOn.mp3');
      this.pcLoginAudio = this.audioService.createAudio('./PCLogin.mp3');
      this.pcLogoutAudio = this.audioService.createAudio('./PCLogout.mp3');
    }

    @ViewChild('pcStorageModal', { static: true }) pcStorageModal!: TemplateRef<any>;
    @ViewChild('pcInfoModal', { static: true }) infoModal!: TemplateRef<any>;

    darkMode!: Observable<boolean>;
    pcTurningOn!: HTMLAudioElement;
    pcLoginAudio!: HTMLAudioElement;
    pcLogoutAudio!: HTMLAudioElement;
    trainerTeam!: PokemonItem[];
    storedPokemon!: PokemonItem[];
    wheelSpinning: boolean = false;
    currentGameState!: GameState;
    infoModalTitle = '';
    infoModalMessage = '';

    ngOnInit(): void {
      this.darkMode = this.darkModeService.darkMode$;
      this.pcTurningOn.addEventListener('ended', () => {
        this.audioService.playAudio(this.pcLoginAudio, 0.30);
      });
      this.gameStateService.wheelSpinningObserver.subscribe(state => {
        this.wheelSpinning = state;
      });
      this.gameStateService.currentState.subscribe(state => {
        this.currentGameState = state;
      });
    }

    showPCModal() {
      if(this.wheelSpinning) {
        return;
      }

      if(this.currentGameState === 'team-rocket-encounter') {
        this.infoModalTitle = 'PC is unavailable';
        this.infoModalMessage = 'Team Rocket is jamming comunications with the PC';
        const modalRef = this.modalService.open(this.infoModal, {
          centered: true,
          size: 'md'
        });
      } else {
        this.trainerTeam = this.trainerService.getTeam();
        this.storedPokemon = this.trainerService.getStored();
        this.audioService.playAudio(this.pcTurningOn, 0.30);

        this.modalService.open(this.pcStorageModal, {
          centered: true,
          size: 'lg',
          backdrop: 'static',
          keyboard: false
        });
      }
    }

    logOut(): void {
      this.audioService.playAudio(this.pcLogoutAudio, 0.30);
      this.modalService.dismissAll();
    }

    closeModal(): void {
      this.modalService.dismissAll();
    }

    getSprite(pokemon: PokemonItem): string {
      if (pokemon.shiny) {
        return pokemon.sprite?.front_shiny || 'place-holder-pixel.png';
      }
      return pokemon.sprite?.front_default || 'place-holder-pixel.png';
    }

    drop(event: CdkDragDrop<PokemonItem[]>) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
      this.trainerService.updateTeam();
    }

    lastPokemonPredicate  = () => this.trainerTeam.length > 1
    teamIsFullPredicate = () => this.trainerTeam.length < 6;
}
