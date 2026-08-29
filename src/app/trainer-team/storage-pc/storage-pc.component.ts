import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { ThemeService } from '../../services/theme-service/theme.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { GameStateService } from '../../services/game-state-service/game-state.service';
import { GameState } from '../../services/game-state-service/game-state';
import {TranslatePipe} from '@ngx-translate/core';
import { SoundFxService } from '../../services/sound-fx-service/sound-fx.service';
import { Subscription } from 'rxjs';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-storage-pc',
  imports: [
    ImageFallbackDirective,
    DragDropModule,
    CommonModule,
    NgIconsModule,
    TranslatePipe
  ],
  templateUrl: './storage-pc.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './storage-pc.component.css'
})
export class StoragePcComponent implements OnInit, OnDestroy {

    constructor(private trainerService: TrainerService,
                private themeService: ThemeService,
                private modalService: NgbModal,
                private gameStateService: GameStateService,
                private soundFxService: SoundFxService) {
    }

    @ViewChild('pcStorageModal', { static: true }) pcStorageModal!: TemplateRef<any>;
    @ViewChild('pcInfoModal', { static: true }) infoModal!: TemplateRef<any>;

    darkMode!: Observable<boolean>;
    trainerTeam!: PokemonItem[];
    storedPokemon!: PokemonItem[];
    wheelSpinning: boolean = false;
    currentGameState!: GameState;
    infoModalTitle = '';
    infoModalMessage = '';
    private readonly subscriptions = new Subscription();
    private removePcTurningOnEndedListener: (() => void) | null = null;

    ngOnInit(): void {
      this.darkMode = this.themeService.isDark$;
      this.removePcTurningOnEndedListener = this.soundFxService.onSoundFxEnded('pc-turning-on', () => {
        void this.soundFxService.playSoundFx('pc-login', 0.30);
      });

      this.subscriptions.add(this.gameStateService.wheelSpinningObserver.subscribe(state => {
        this.wheelSpinning = state;
      }));

      this.subscriptions.add(this.gameStateService.currentState.subscribe(state => {
        this.currentGameState = state;
      }));
    }

    ngOnDestroy(): void {
      this.removePcTurningOnEndedListener?.();
      this.subscriptions.unsubscribe();
    }

    showPCModal() {
      if(this.wheelSpinning) {
        return;
      }

      if(this.currentGameState === 'team-rocket-encounter') {
        this.infoModalTitle = 'trainer.storage.unavailable';
        this.infoModalMessage = 'trainer.storage.unavailableMessage';
        this.modalService.open(this.infoModal, {
          centered: true,
          size: 'md'
        });
      } else {
        this.trainerTeam = this.trainerService.getTeam();
        this.storedPokemon = this.trainerService.getStored();
        void this.soundFxService.playSoundFx('pc-turning-on', 0.30);

        this.modalService.open(this.pcStorageModal, {
          centered: true,
          size: 'lg',
          backdrop: 'static',
          keyboard: false
        });
      }
    }

    logOut(): void {
      void this.soundFxService.playSoundFx('pc-logout', 0.30);
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
      this.trainerService.commitTeamAndStorage(this.trainerTeam, this.storedPokemon);
    }

    lastPokemonPredicate  = () => this.trainerTeam.length > 1
    teamIsFullPredicate = () => this.trainerTeam.length < 6;
}
