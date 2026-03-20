import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRepeat } from '@ng-icons/bootstrap-icons';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-restart-game-buttom',
  imports: [
    NgIconsModule,
    TranslatePipe
  ],
  providers: [
    provideIcons({ bootstrapArrowRepeat })
  ],
  templateUrl: './restart-game-buttom.component.html',
  styleUrl: './restart-game-buttom.component.css'
})
export class RestartGameButtonComponent {

  constructor(private modalService: NgbModal,
              private gameStateService: GameStateService
  ) {
    this.gameStateService.wheelSpinningObserver.subscribe(state => {
      this.wheelSpinning = state;
    });
  }

  wheelSpinning: boolean = false;
  @ViewChild('restartGameModal', { static: true }) restartGameModal!: TemplateRef<any>;
  @Output() restartEvent = new EventEmitter<boolean>();

  showRestartGameConfirmModal() {
    if(this.wheelSpinning) {
      return;
    }
    this.modalService.open(this.restartGameModal, {
      centered: true,
      size: 'lg'
    });
  }

  confirmRestart(): void {
    this.restartEvent.emit(true);
    this.closeModal();
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}
