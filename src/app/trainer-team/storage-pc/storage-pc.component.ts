import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { TrainerService } from '../../services/trainer-service/trainer.service';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-storage-pc',
  imports: [
    CommonModule,
    NgIconsModule
  ],
  templateUrl: './storage-pc.component.html',
  styleUrl: './storage-pc.component.css'
})
export class StoragePcComponent implements OnInit {

    constructor(private trainerService: TrainerService,
                private darkModeService: DarkModeService,
                private modalService: NgbModal) { }

    @ViewChild('pcStorageModal', { static: true }) pcStorageModal!: TemplateRef<any>;
    darkMode!: Observable<boolean>;
    pcTurningOn = new Audio('./PCTurningOn.mp3');
    pcLoginAudio = new Audio('./PCLogin.mp3');
    pcLogoutAudio = new Audio('./PCLogout.mp3');

    ngOnInit(): void {
      this.darkMode = this.darkModeService.darkMode$;
      this.pcTurningOn.addEventListener('ended', () => {
        this.pcLoginAudio.volume = 0.30;
        this.pcLoginAudio.play();
      });
    }

    showPCModal() {
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
      this.pcLogoutAudio.volume = 0.30;
      this.pcLogoutAudio.play();
      this.modalService.dismissAll();
    }
}
