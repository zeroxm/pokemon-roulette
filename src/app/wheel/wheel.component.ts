import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { WheelItem } from '../interfaces/wheel-item';

@Component({
  selector: 'app-wheel',
  imports: [],
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
  spinning = false;

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

  constructor() {
    this.canvasHeight = window.innerHeight * 0.50;
    this.wheelWidth = this.canvasHeight;
    this.cursorWidth = 40;
    this.fontSize = this.wheelWidth / 20;
  }

  ngAfterViewInit(): void {
    this.wheelCanvas = <HTMLCanvasElement>document.getElementById('wheel');
    this.wheelCtx = this.wheelCanvas.getContext('2d')!;
    this.pointerCanvas = <HTMLCanvasElement>document.getElementById('pointer');
    this.pointerCtx = this.pointerCanvas.getContext('2d')!;
    if (this.items.length > 32) {
      this.fontSize = 10;
    }
    this.drawWheel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && changes['items'].previousValue !== undefined) {
      console.debug(changes['items']);
      this.drawWheel();
    }
  }

  private drawWheel(rotation = 0): void {
    const centerX = this.wheelCanvas.width / 2;
    const centerY = this.wheelCanvas.height / 2;
    const radius = (this.wheelCanvas.width / 2);

    const arcSize = (2 * Math.PI) / (this.items.length * this.getMultiplier());

    this.wheelCtx.clearRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);

    for (let i = 0; i < this.items.length; i++) {
      for (let j = 0; j < this.getMultiplier(); j++) {
        const index = i * this.getMultiplier() + j;
        let item = this.items[index % this.items.length];
        this.wheelCtx.beginPath();
        this.wheelCtx.arc(centerX, centerY, radius, index * arcSize + rotation, (index + 1) * arcSize + rotation);
        this.wheelCtx.lineTo(centerX, centerY);
        this.wheelCtx.fillStyle = item.fillStyle;
        this.wheelCtx.fill();

        this.wheelCtx.save();
        this.wheelCtx.translate(centerX, centerY);
        this.wheelCtx.rotate((index + 0.5) * arcSize + rotation);
        this.wheelCtx.fillStyle = '#fff';
        this.wheelCtx.font = this.fontSize+'px Arial';
        this.wheelCtx.textAlign = 'right';
        this.wheelCtx.fillText(item.text, radius - 7, 5);
        this.wheelCtx.restore();
      }
    }
    this.drawPointer();
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

    this.startTime = performance.now();
    const arcSize = (2 * Math.PI) / (this.items.length * this.getMultiplier());
    if (this.items.length === 8 || this.items[0].text === 'Battle Trainer') {
      this.winningNumber = 0;
    } else if (this.items[1].text === 'Eevee') {
      this.winningNumber = 1;
    } else {
      this.winningNumber = Math.floor(Math.random() * this.items.length);
    }

    this.totalRotations = Math.floor(Math.random() * 4) + 1;
    const winningAngle = this.winningNumber * arcSize;
    const fixedOffset = arcSize / 2;
    this.finalRotation = this.totalRotations * 2 * Math.PI + (2 * Math.PI - winningAngle - fixedOffset);

    requestAnimationFrame(this.animate.bind(this));
  }

  private animate(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    this.currentRotation = easedProgress * this.finalRotation;

    this.drawWheel(this.currentRotation);

    if (progress < 1) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      this.spinning = false;
      this.selectedItemEvent.emit(this.winningNumber % this.items.length);
    }

    this.currentSegment = this.getCurrentSegment();
  }

  private getCurrentSegment(): string {
    const currentAngle = this.currentRotation % (2 * Math.PI);
    const arcSize = (2 * Math.PI) / (this.items.length * this.getMultiplier());
    const segmentIndex = Math.floor(currentAngle / arcSize);
    const segmentAmount = this.items.length * this.getMultiplier();
    const currentIndex = (segmentAmount - segmentIndex - 1) % this.items.length;
    return this.items[currentIndex]?.text;
  }

  private getMultiplier(): number {
    if (this.items.length === 4) {
      return 2;
    } else if (this.items.length === 3) {
      return 3;
    } else if (this.items.length === 2) {
      return 4;
    }
    return 1; // Default to 1 for 5 or more items
  }
  
}


