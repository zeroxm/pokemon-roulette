import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-generation-map',
  imports: [
    TranslatePipe
  ],
  templateUrl: './generation-map.component.html',
  styleUrl: './generation-map.component.css'
})
export class GenerationMapComponent implements AfterViewInit, OnChanges {

  @Input() progressPath: { x: number, y: number }[] = [];
  @Input() playerPosition: { x: number, y: number } = { x: 50, y: 50 };
  @Input() visible = false;


  originalWidth = 800;  // Original map width (change to match your image size)
  originalHeight = 600; // Original map height

  currentWidth = this.originalWidth;
  currentHeight = this.originalHeight;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.progressPath = [];
    this.updateSize();
    // this.resetPathData();
  }

  @HostListener('window:resize')
  updateSize() {
    const container = this.elementRef.nativeElement.querySelector('.map-container');
    if (container) {
      this.currentWidth = container.clientWidth;
      this.currentHeight = container.clientHeight;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      // this.resetPathData();
    }
  }

  resetPathData() {
    this.progressPath = [];
    this.updateSize();
    // Add a new point to the progress path
    this.progressPath.push({ x: 182, y: 450 });
    this.progressPath.push({ x: 182, y: 215 });
    this.progressPath.push({ x: 320, y: 215 });
    this.progressPath.push({ x: 320, y: 180 });
    this.progressPath.push({ x: 517, y: 180 });
    this.progressPath.push({ x: 517, y: 383 });

    // Update the player position
    this.playerPosition = { x: 517, y: 383 };
  }

  getPathData(): string {
    return this.progressPath
      .map(p => `${(p.x / this.originalWidth) * this.currentWidth},${(p.y / this.originalHeight) * this.currentHeight}`)
      .join(' ');
  }

  getPlayerX(): number {
    // return (this.playerPosition.x / this.originalWidth) * this.currentWidth;
    return 0;
  }

  getPlayerY(): number {
    // return (this.playerPosition.y / this.originalHeight) * this.currentHeight;
    return 0;
  }
}
