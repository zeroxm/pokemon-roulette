import { SpinAnimation } from './spin-animation';

describe('SpinAnimation', () => {
  let frames: number[];
  let finished: number;
  let animation: SpinAnimation;

  beforeEach(() => {
    frames = [];
    finished = 0;
    animation = new SpinAnimation(r => frames.push(r), () => { finished++; });
  });

  afterEach(() => animation.cancel());

  it('reports whether it is running', async () => {
    expect(animation.running).toBeFalse();
    animation.start(Math.PI, 50);
    expect(animation.running).toBeTrue();

    await new Promise(resolve => setTimeout(resolve, 120));
    expect(animation.running).withContext('should stop once complete').toBeFalse();
  });

  it('eases to exactly the requested rotation and finishes once', async () => {
    animation.start(Math.PI * 4, 50);
    await new Promise(resolve => setTimeout(resolve, 120));

    expect(finished).toBe(1);
    expect(frames.at(-1)).toBeCloseTo(Math.PI * 4, 5);
  });

  it('stops delivering frames after cancel', async () => {
    animation.start(Math.PI * 4, 500);
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)));

    animation.cancel();
    const seenAtCancel = frames.length;

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(frames.length)
      .withContext('a cancelled spin must not keep painting a detached canvas')
      .toBe(seenAtCancel);
    expect(finished).withContext('and must not emit a result').toBe(0);
  });

  it('restarting cancels the previous run rather than stacking loops', async () => {
    animation.start(Math.PI, 500);
    animation.start(Math.PI * 2, 50);

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(finished).toBe(1);
    expect(frames.at(-1)).toBeCloseTo(Math.PI * 2, 5);
  });
});
