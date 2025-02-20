import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDrag, CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PokemonItem } from '../../interfaces/pokemon-item';

@Component({
  selector: 'app-storage-pc',
  imports: [
    DragDropModule,
    CommonModule,
    NgIconsModule
  ],
  templateUrl: './storage-pc.component.html',
  styleUrl: './storage-pc.component.css'
})
export class StoragePcComponent implements OnInit, OnDestroy {

    constructor(private trainerService: TrainerService,
                private darkModeService: DarkModeService,
                private modalService: NgbModal) { }

    @ViewChild('pcStorageModal', { static: true }) pcStorageModal!: TemplateRef<any>;
    darkMode!: Observable<boolean>;
    pcTurningOn = new Audio('./PCTurningOn.mp3');
    pcLoginAudio = new Audio('./PCLogin.mp3');
    pcLogoutAudio = new Audio('./PCLogout.mp3');
    trainerTeam!: PokemonItem[];
    
    private teamSubscription!: Subscription;
    
    ngOnInit(): void {
      this.darkMode = this.darkModeService.darkMode$;
      this.pcTurningOn.addEventListener('ended', () => {
        this.pcLoginAudio.volume = 0.30;
        this.pcLoginAudio.play();
      });
    }

    ngOnDestroy(): void {
      this.teamSubscription?.unsubscribe();
    }

    showPCModal() {
      this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
        this.trainerTeam = team;
      });
      this.pcTurningOn.volume = 0.30;
      this.pcTurningOn.play();

      this.modalService.open(this.pcStorageModal, {
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });
    }

    logOut(): void {
      this.teamSubscription?.unsubscribe();
      this.pcLogoutAudio.volume = 0.30;
      this.pcLogoutAudio.play();
      this.modalService.dismissAll();
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
    }

    lastPokemonPredicate  = () => this.trainerTeam.length > 1
    teamIsFullPredicate = () => this.trainerTeam.length < 6;
}
