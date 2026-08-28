import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageFallbackDirective, IMAGE_FALLBACK_SRC } from './image-fallback.directive';

@Component({
  standalone: true,
  imports: [ImageFallbackDirective],
  template: `<img [src]="src"><img [src]="src" fallbackSrc="./custom.png">`,
})
class HostComponent {
  src = 'https://example.invalid/missing.png';
}

describe('ImageFallbackDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let images: HTMLImageElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    images = Array.from(fixture.nativeElement.querySelectorAll('img'));
  });

  it('swaps in the placeholder when an image fails', () => {
    images[0].dispatchEvent(new Event('error'));
    expect(images[0].getAttribute('src')).toContain(IMAGE_FALLBACK_SRC.replace('./', ''));
  });

  it('honours a custom fallback', () => {
    images[1].dispatchEvent(new Event('error'));
    expect(images[1].getAttribute('src')).toContain('custom.png');
  });

  it('does not loop when the placeholder itself fails', () => {
    images[0].dispatchEvent(new Event('error'));
    const afterFirst = images[0].getAttribute('src');

    images[0].dispatchEvent(new Event('error'));
    expect(images[0].getAttribute('src'))
      .withContext('a second failure must not retrigger the swap')
      .toBe(afterFirst);
  });
});
