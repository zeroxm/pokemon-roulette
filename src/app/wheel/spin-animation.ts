/**
 * Drives the wheel's spin-and-ease-out over time.
 *
 * Pulled out of `WheelComponent` so the loop owns its own frame handle: the component had no
 * `ngOnDestroy`, so a spin interrupted by a state change kept animating a detached canvas and
 * still emitted its result.
 */
export class SpinAnimation {
  private frameId: number | null = null;
  private startTime = 0;
  private durationMs = 0;
  private finalRotation = 0;

  constructor(
    private readonly onFrame: (rotation: number) => void,
    private readonly onFinish: () => void,
  ) {}

  get running(): boolean {
    return this.frameId !== null;
  }

  start(finalRotation: number, durationMs: number): void {
    this.cancel();
    this.finalRotation = finalRotation;
    this.durationMs = durationMs;
    this.startTime = performance.now();
    this.frameId = requestAnimationFrame(this.step);
  }

  /** Stops the loop without finishing. Safe to call when not running. */
  cancel(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly step = (now: number): void => {
    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    this.onFrame(eased * this.finalRotation);

    if (progress < 1) {
      this.frameId = requestAnimationFrame(this.step);
      return;
    }

    this.frameId = null;
    this.onFinish();
  };
}
