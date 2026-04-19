import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { WheelItem } from '../interfaces/wheel-item';
import { DarkModeService } from '../services/dark-mode-service/dark-mode.service';
import { ThemeService } from '../services/theme-service/theme.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../services/game-state-service/game-state.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SoundFxHandle, SoundFxService } from '../services/sound-fx-service/sound-fx.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-wheel',
  imports: [
    CommonModule,
    TranslatePipe
  ],
  templateUrl: './wheel.component.html',
  styleUrl: './wheel.component.css'
})
export class WheelComponent implements AfterViewInit, OnChanges {

  wheelCanvas!: HTMLCanvasElement;
  wheelCtx!: CanvasRenderingContext2D;
  pointerCanvas!: HTMLCanvasElement;
  pointerCtx!: CanvasRenderingContext2D;
  @Input() items: WheelItem[] = [];
  @Output() selectedItemEvent = new EventEmitter<number>();
  @ViewChild('wheel') wheelCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pointer') pointerCanvasRef!: ElementRef<HTMLCanvasElement>;
  spinning = false;
  darkMode!: Observable<boolean>;

  canvasHeight: number;
  wheelWidth: number;
  cursorWidth: number;
  fontSize: number;
  currentRotation = 0;
  startTime = 0;
  totalRotations!: number;
  duration = Math.floor(Math.random() * (2000)) + 3000;
  finalRotation = 0;
  pointerStrokeColor = 'blue';
  pointerFillColor = 'yellow';
  winningNumber!: number;
  currentSegment: string = '-';
  clickAudio!: SoundFxHandle;

  private translatedItems: WheelItem[] = [];
  private readonly mobileBreakpoint = 768;

  constructor(
    private darkModeService: DarkModeService,
    private themeService: ThemeService,
    private gameStateService: GameStateService,
    private translateService: TranslateService,
    private soundFxService: SoundFxService,
    private modalService: NgbModal
  ) {
    this.clickAudio = this.soundFxService.createClickSoundFx();
    this.darkMode = this.themeService.isDark$;
    this.canvasHeight = 0;
    this.wheelWidth = 0;
    this.cursorWidth = 40;
    this.fontSize = 0;
    this.updateWheelDimensions();
  }

  ngAfterViewInit(): void {
    this.wheelCanvas = this.wheelCanvasRef.nativeElement;
    this.wheelCtx = this.wheelCanvas.getContext('2d')!;
    this.pointerCanvas = this.pointerCanvasRef.nativeElement;
    this.pointerCtx = this.pointerCanvas.getContext('2d')!;

    // Wait for translations to be ready
    this.translateService.get('wheel.spin').subscribe(() => {
      this.preprocessTranslations();
      this.drawWheel();
      this.drawPointer();
    });
  }

  @HostListener('window:resize')
  handleResize(): void {
    this.updateWheelDimensions();

    if (this.wheelCtx && this.pointerCtx) {
      this.drawWheel(this.currentRotation);
      this.drawPointer();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      this.translateService.get('wheel.spin').subscribe(() => {
        this.preprocessTranslations();
        this.drawWheel();
        this.drawPointer();
      });
    }
  }

  private preprocessTranslations(): void {
    this.translatedItems = this.items.map(item => ({
      ...item,
      text: this.translateService.instant(item.text)
    }));
  }

  private updateWheelDimensions(): void {
    const viewportMin = Math.min(window.innerHeight, window.innerWidth);
    const wheelScale = window.innerWidth <= this.mobileBreakpoint ? 0.70 : 0.55;

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
    const segRadius = radius * 0.88;  // leave outer 12% for border ring (WHEEL-02)

    const totalWeight = this.getTotalWeights();
    const arcSize = (2 * Math.PI) / (totalWeight);
    this.wheelCtx.clearRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);

    // Border ring first — behind segments (WHEEL-02)
    this.drawBorderRing(centerX, centerY, radius);

    let startAngle = rotation;
    for (let index = 0; index < this.translatedItems.length; index++) {
      const item = this.translatedItems[index];
      const segmentSize = arcSize * item.weight;
      const endAngle = startAngle + segmentSize;

      /** Draw the segment */
      this.wheelCtx.beginPath();
      this.wheelCtx.arc(centerX, centerY, segRadius, startAngle, endAngle);
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
        this.wheelCtx.fillText(item.text, segRadius - 7, 5);
        this.wheelCtx.restore();
      }

      startAngle = endAngle;
    }

    // Pokéball on top — last draw call (WHEEL-01)
    const pbRadius = window.innerWidth <= this.mobileBreakpoint ? radius * 0.15 : radius * 0.10;
    this.drawPokeball(centerX, centerY, pbRadius);
  }

  private drawBorderRing(cx: number, cy: number, radius: number): void {
    const ctx = this.wheelCtx;
    const segRadius = radius * 0.88;
    const ringWidth = radius - segRadius;
    const ringMidR  = segRadius + ringWidth / 2;

    const gradient = ctx.createRadialGradient(cx, cy, segRadius, cx, cy, radius);
    gradient.addColorStop(0.0,  '#FFD700');  // bright gold inner
    gradient.addColorStop(0.4,  '#DAA520');  // goldenrod mid
    gradient.addColorStop(0.75, '#8B6914');  // dark gold
    gradient.addColorStop(1.0,  '#2C1A0A');  // dark wood outer

    ctx.beginPath();
    ctx.arc(cx, cy, ringMidR, 0, Math.PI * 2);
    ctx.lineWidth   = ringWidth;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // thin black outer edge
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
    ctx.lineWidth   = 1;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }

  private drawPokeball(cx: number, cy: number, pbRadius: number): void {
    const ctx = this.wheelCtx;

    // Red upper half
    ctx.beginPath();
    ctx.arc(cx, cy, pbRadius, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = '#CC0000';
    ctx.fill();

    // White lower half
    ctx.beginPath();
    ctx.arc(cx, cy, pbRadius, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Black outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, pbRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = pbRadius * 0.12;
    ctx.stroke();

    // Black belt
    const beltHW = pbRadius * 0.12;
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - pbRadius, cy - beltHW, pbRadius * 2, beltHW * 2);

    // Button: black outer circle
    const btnRadius = pbRadius * 0.28;
    ctx.beginPath();
    ctx.arc(cx, cy, btnRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Button: grey inner fill
    ctx.beginPath();
    ctx.arc(cx, cy, btnRadius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#DDDDDD';
    ctx.fill();
  }

  drawPointer(): void {
    this.pointerCtx.clearRect(0, 0, this.pointerCanvas.width, this.pointerCanvas.height);
    this.pointerCtx.save();

    const pw = this.pointerCanvas.width;
    const ph = this.pointerCanvas.height;
    const cw = this.cursorWidth;        // 40
    const bx = pw - cw;
    const by = ph / 2 - cw / 2;

    // Left-pointing ⚡ bolt — 7 points:
    // The signature lightning look comes from the sharp Z-slash:
    //   p3 (upper-right) → p4 (center-left) creates the steep diagonal cut
    //   p5 (center-right) → p6 (lower-right) continues as the lower section
    //   p7 → p1 (close) forms the left-facing pointed tail
    this.pointerCtx.beginPath();
    this.pointerCtx.moveTo(bx,            by + cw*0.45);  // p1: pointed tip (slightly above center)
    this.pointerCtx.lineTo(bx + cw*0.20,  by);             // p2: upper-left shoulder
    this.pointerCtx.lineTo(bx + cw,       by);             // p3: upper-right corner
    this.pointerCtx.lineTo(bx + cw*0.42,  by + cw*0.46);  // p4: slash center-left (⚡ ZIG — steep cut)
    this.pointerCtx.lineTo(bx + cw*0.58,  by + cw*0.54);  // p5: slash center-right (⚡ ZAG — resumes)
    this.pointerCtx.lineTo(bx + cw,       by + cw);        // p6: lower-right corner
    this.pointerCtx.lineTo(bx + cw*0.80,  by + cw);        // p7: lower-left shoulder
    this.pointerCtx.closePath();

    this.pointerCtx.fillStyle   = '#FFD700';
    this.pointerCtx.fill();
    this.pointerCtx.strokeStyle = '#1a1a00';
    this.pointerCtx.lineWidth   = 1.5;
    this.pointerCtx.stroke();

    this.pointerCtx.restore();
  }

  spinWheel(): void {
    if (this.spinning) {
      return;
    }

    this.spinning = true;
    this.gameStateService.setWheelSpinning(this.spinning);


    this.startTime = performance.now();
    const totalWeight = this.getTotalWeights();
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

    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    this.currentRotation = easedProgress * this.finalRotation;

    const totalWeight = this.getTotalWeights();

    this.drawWheel(this.currentRotation);

    if (progress < 1) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      this.spinning = false;
      this.selectedItemEvent.emit(this.winningNumber);
      this.gameStateService.setWheelSpinning(false);
    }

    const segment = this.getCurrentSegment();

    if (segment !== this.currentSegment) {
      this.currentSegment = segment;
      void this.soundFxService.playSoundFx(this.clickAudio, 1.0, { preventOverlap: true });
    }
  }

  private getCurrentSegment(): string {
    const totalWeight = this.getTotalWeights();

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

  private getTotalWeights(): number {
    return this.translatedItems.reduce((sum, item) => sum + item.weight, 0);
  }

  getRandomWeightedIndex(): number {
    const totalWeight = this.getTotalWeights();
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
