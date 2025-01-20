import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

export interface Item {
  text: string,
  fillStyle: string
}
@Component({
  selector: 'app-wheel',
  imports: [],
  templateUrl: './wheel.component.html',
  styleUrl: './wheel.component.css'
})
export class WheelComponent implements AfterViewInit {

  wheelCanvas!: HTMLCanvasElement;
  wheelCtx!: CanvasRenderingContext2D;
  pointerCanvas!: HTMLCanvasElement;
  pointerCtx!: CanvasRenderingContext2D;
  @Input() items: Item[] = [];
  @Output() selectedItemEvent = new EventEmitter<number>();
  spinning = false;

  canvasHeight  = 400;
  wheelWidth = 400;
  cursorWidth = 40;
  currentRotation = 0;
  startTime = 0;
  totalRotations = Math.floor(Math.random() * 4) + 1;
  duration = Math.floor(Math.random() * (5000 - 3000)) + 3000;
  finalRotation = 0;
  pointerStrokeColor = 'blue';
  pointerFillColor = 'yellow';
  winningNumber!: number;
  currentSegment: string = '-';

  constructor() {

  }

  ngAfterViewInit(): void {
    this.wheelCanvas = <HTMLCanvasElement>document.getElementById('wheel');
    this.wheelCtx = this.wheelCanvas.getContext('2d')!;
    this.pointerCanvas = <HTMLCanvasElement>document.getElementById('pointer');
    this.pointerCtx = this.pointerCanvas.getContext('2d')!;
    this.drawWheel();
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
        this.wheelCtx.font = '18px Arial';
        this.wheelCtx.textAlign = 'center';
        this.wheelCtx.fillText(item.text, radius/2, 5);
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
    this.pointerCtx.lineTo(this.pointerCanvas.width - 42, this.pointerCanvas.height / 2);
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
    if(this.items.length < 5) {
      this.winningNumber = Math.floor(Math.random() * this.items.length * this.getMultiplier());
    } else {
      this.winningNumber = 0;
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


