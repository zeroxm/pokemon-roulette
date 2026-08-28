import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/** Placeholder shown when an image cannot load. Ships with the app rather than being fetched. */
export const IMAGE_FALLBACK_SRC = './place-holder-pixel.png';

/**
 * Swaps in a local placeholder when an image fails to load.
 *
 * Nearly every sprite in the game is hot-linked from `raw.githubusercontent.com`, which is a
 * source-fetch endpoint with unauthenticated per-IP rate limits rather than a CDN — and the URLs
 * point at a moving branch. A user behind a shared NAT, offline, or hitting the repo after a
 * restructure would otherwise see broken-image icons across the whole UI.
 *
 * Applies to every `<img>` in a component that imports it; no per-tag opt-in.
 */
@Directive({
  selector: 'img',
  standalone: true,
})
export class ImageFallbackDirective {
  /** Override for images that want a different placeholder. */
  @Input() fallbackSrc = IMAGE_FALLBACK_SRC;

  private failed = false;

  constructor(private readonly element: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    // Guard against a loop if the placeholder itself is also missing.
    if (this.failed) {
      return;
    }
    this.failed = true;
    this.element.nativeElement.src = this.fallbackSrc;
  }
}
