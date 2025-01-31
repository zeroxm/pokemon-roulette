import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-restart-game',
  imports: [
    NgIconsModule
  ],
  templateUrl: './restart-game.component.html',
  styleUrl: './restart-game.component.css'
})
export class RestartGameComponent {

  constructor(private modalService: NgbModal) {

  }

  @ViewChild('restartGameModal', { static: true }) restartGameModal!: TemplateRef<any>;
  @Output() restartEvent = new EventEmitter<boolean>();

  showRestartGameConfirmModal() {
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
