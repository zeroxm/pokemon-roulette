import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { WheelItem } from '../interfaces/wheel-item';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SoundFxHandle, SoundFxService } from '../services/sound-fx-service/sound-fx.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from '../services/settings-service/settings.service';

@Component({
  selector: 'app-wheel',
  imports: [
    CommonModule,
    TranslatePipe
  ],
  templateUrl: './wheel.component.html',
  styleUrl: './wheel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelComponent implements AfterViewInit, OnChanges, OnDestroy {

  wheelCanvas!: HTMLCanvasElement;
  wheelCtx!: CanvasRenderingContext2D;
  pointerCanvas!: HTMLCanvasElement;
  pointerCtx!: CanvasRenderingContext2D;
  @Input() items: WheelItem[] = [];
  @Output() selectedItemEvent = new EventEmitter<number>();
  spinning = false;
  darkMode!: Observable<boolean>;

  canvasHeight: number;
  wheelWidth: number;
  cursorWidth: number;
  fontSize: number;
  currentRotation = 0;
  startTime = 0;
  totalRotations!: number;
  duration = Math.floor(Math.random() * (5000 - 3000)) + 3000;
  finalRotation = 0;
  pointerStrokeColor = 'blue';
  pointerFillColor = 'yellow';
  winningNumber!: number;
  currentSegment: string = '-';
  clickAudio!: SoundFxHandle;

  private translatedItems: WheelItem[] = [];
  private readonly mobileBreakpoint = 768;
  private cachedTotalWeight = 0;
  private readonly boundAnimate = this.animate.bind(this);
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  private autoSpinTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private darkModeService: DarkModeService,
    private gameStateService: GameStateService,
    private translateService: TranslateService,
    private soundFxService: SoundFxService,
    private modalService: NgbModal,
    private settingsService: SettingsService,
    private ngZone: NgZone
  ) {
    this.clickAudio = this.soundFxService.createClickSoundFx();
    this.darkMode = this.darkModeService.darkMode$;
    this.canvasHeight = 0;
    this.wheelWidth = 0;
    this.cursorWidth = 40;
    this.fontSize = 0;
    this.updateWheelDimensions();
  }

  ngAfterViewInit(): void {
    this.wheelCanvas = <HTMLCanvasElement>document.getElementById('wheel');
    this.wheelCtx = this.wheelCanvas.getContext('2d')!;
    this.pointerCanvas = <HTMLCanvasElement>document.getElementById('pointer');
    this.pointerCtx = this.pointerCanvas.getContext('2d')!;

    // Wait for translations to be ready
    this.translateService.get('wheel.spin').subscribe(() => {
      this.preprocessTranslations();
      this.drawWheel();
      this.drawPointer();
      this.tryAutoSpin();
    });
  }

  @HostListener('window:resize')
  handleResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.updateWheelDimensions();
      if (this.wheelCtx && this.pointerCtx) {
        this.drawWheel(this.currentRotation);
        this.drawPointer();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      this.translateService.get('wheel.spin').subscribe(() => {
        this.preprocessTranslations();
        this.drawWheel();
        this.drawPointer();
        this.tryAutoSpin();
      });
    }
  }

  private preprocessTranslations(): void {
    this.translatedItems = this.items.map(item => ({
      ...item,
      text: this.translateService.instant(item.text)
    }));
    this.cachedTotalWeight = this.translatedItems.reduce((sum, item) => sum + item.weight, 0);
  }

  private updateWheelDimensions(): void {
    const viewportMin = Math.min(window.innerHeight, window.innerWidth);
    const wheelScale = window.innerWidth <= this.mobileBreakpoint ? 0.64 : 0.50;

    this.canvasHeight = viewportMin * wheelScale;
    this.wheelWidth = this.canvasHeight;
    this.fontSize = this.wheelWidth / 24;

    if (this.items.length >= 32) {
      this.fontSize = Math.min(this.fontSize, 10);
    } else if (this.items.length >= 16) {
      this.fontSize = Math.min(this.fontSize, 14);
    }
  }

  private drawWheel(rotation = 0): void {
    const centerX = this.wheelCanvas.width / 2;
    const centerY = this.wheelCanvas.height / 2;
    const radius = (this.wheelCanvas.width / 2);

    const totalWeight = this.cachedTotalWeight;
    const arcSize = (2 * Math.PI) / (totalWeight);
    this.wheelCtx.clearRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);

    let startAngle = rotation;
    for (let index = 0; index < this.translatedItems.length; index++) {
      const item = this.translatedItems[index];
      const segmentSize = arcSize * item.weight;
      const endAngle = startAngle + segmentSize;

      /** Draw the segment */
      this.wheelCtx.beginPath();
      this.wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.wheelCtx.lineTo(centerX, centerY);
      this.wheelCtx.fillStyle = item.fillStyle;
      this.wheelCtx.fill();

      if (this.translatedItems.length < 160) {
        /** Draw the text */
        this.wheelCtx.save();
        this.wheelCtx.translate(centerX, centerY);
        this.wheelCtx.rotate(startAngle + segmentSize / 2);
        this.wheelCtx.fillStyle = '#fff';
        this.wheelCtx.font = this.fontSize + 'px Arial';
        this.wheelCtx.textAlign = 'right';
        this.wheelCtx.fillText(item.text, radius - 7, 5);
        this.wheelCtx.restore();
      }

      startAngle = endAngle;
    }
  }

  drawPointer(): void {
    this.pointerCtx.save();
    this.pointerCtx.lineWidth = 2;
    this.pointerCtx.strokeStyle = this.pointerStrokeColor;
    this.pointerCtx.fillStyle = this.pointerFillColor;
    this.pointerCtx.beginPath();
    this.pointerCtx.moveTo(this.pointerCanvas.width - 2, (this.pointerCanvas.height / 2) - 20);
    this.pointerCtx.lineTo(this.pointerCanvas.width - 2, (this.pointerCanvas.height / 2) + 20);
    this.pointerCtx.lineTo(this.pointerCanvas.width - this.cursorWidth, this.pointerCanvas.height / 2);
    this.pointerCtx.lineTo(this.pointerCanvas.width - 2, (this.pointerCanvas.height / 2) - 20);
    this.pointerCtx.stroke();
    this.pointerCtx.fill();
    this.pointerCtx.restore();
  }

  spinWheel(): void {
    if (this.spinning) {
      return;
    }

    this.spinning = true;
    this.gameStateService.setWheelSpinning(this.spinning);
    this.duration = Math.floor(Math.random() * (5000 - 3000)) + 3000;

    this.startTime = performance.now();
    const totalWeight = this.cachedTotalWeight;
    const arcSize = (2 * Math.PI) / (totalWeight);

    this.winningNumber = this.getRandomWeightedIndex();

    this.totalRotations = Math.floor(Math.random() * 4) + 1;

    let winningAngle = 0;
    const winningSegmentSize = arcSize * this.items[this.winningNumber].weight;

    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      winningAngle += arcSize * item.weight;
      if (index === this.winningNumber) {
        break;
      }
    }

    const offset = Math.random() * winningSegmentSize;
    this.finalRotation = this.totalRotations * 2 * Math.PI + (2 * Math.PI - winningAngle + offset);

    // Run animation outside Angular zone to avoid triggering change detection on every frame
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(this.boundAnimate);
    });
  }

  private animate(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    this.currentRotation = easedProgress * this.finalRotation;

    this.drawWheel(this.currentRotation);

    if (progress < 1) {
      requestAnimationFrame(this.boundAnimate);
    } else {
      // Re-enter Angular zone for state changes that affect the UI
      this.ngZone.run(() => {
        this.spinning = false;
        this.selectedItemEvent.emit(this.winningNumber);
        this.gameStateService.setWheelSpinning(false);
      });
    }

    const segment = this.getCurrentSegment();

    if (segment !== this.currentSegment) {
      this.currentSegment = segment;
      void this.soundFxService.playSoundFx(this.clickAudio, 1.0, { preventOverlap: true });
    }
  }

  private getCurrentSegment(): string {
    const totalWeight = this.cachedTotalWeight;

    const currentAngle = (2 * Math.PI - (this.currentRotation % (2 * Math.PI))) % (2 * Math.PI);
    let accumulatedWeight = 0;

    for (const item of this.translatedItems) {
      accumulatedWeight += item.weight;
      const segmentEnd = (accumulatedWeight / totalWeight) * 2 * Math.PI;

      if (currentAngle <= segmentEnd) {
        return item.text;
      }
    }
    return '-';
  }

  getRandomWeightedIndex(): number {
    const totalWeight = this.cachedTotalWeight;
    let random = Math.random() * totalWeight;
    let accumulatedWeight = 0;

    for (let i = 0; i < this.translatedItems.length; i++) {
      accumulatedWeight += this.translatedItems[i].weight;
      if (random < accumulatedWeight) {
        return i;
      }
    }
    return this.translatedItems.length - 1;
  }

  ngOnDestroy(): void {
    if (this.autoSpinTimeout) {
      clearTimeout(this.autoSpinTimeout);
    }
  }

  private tryAutoSpin(): void {
    if (this.autoSpinTimeout) {
      clearTimeout(this.autoSpinTimeout);
    }
    if (this.settingsService.currentSettings.autoSpin && !this.spinning && !this.modalService.hasOpenModals()) {
      this.autoSpinTimeout = setTimeout(() => {
        if (!this.spinning && !this.modalService.hasOpenModals()) {
          this.spinWheel();
        }
      }, 500);
    }
  }

  @HostListener('window:keydown.space', ['$event'])
  handleSpacebar(event: Event): void {
    const activeElement = document.activeElement;
    const isInputOrButtonFocused = activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLButtonElement ||
      activeElement?.getAttribute('role') === 'button';

    if (!this.spinning && !this.modalService.hasOpenModals() && !isInputOrButtonFocused) {
      event.preventDefault();
      this.spinWheel();
    }
  }
}
