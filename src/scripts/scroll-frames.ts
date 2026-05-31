export interface ScrollFramesOptions {
  /** Высокая секция, по высоте которой идёт скролл (position тут relative). */
  section: HTMLElement;
  /** Canvas внутри sticky-обёртки. */
  canvas: HTMLCanvasElement;
  /** Всего кадров. */
  frameCount: number;
  /** Строитель пути к кадру по индексу (0-based). */
  framePath: (index: number) => string;
  /** Колбэк прогресса префетча 0..1 (для лоадера). */
  onProgress?: (loaded: number, total: number) => void;
  /** Колбэк готовности. */
  onReady?: () => void;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class ScrollFrames {
  private readonly section: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly frameCount: number;
  private readonly framePath: (index: number) => string;
  private readonly onProgress?: (loaded: number, total: number) => void;
  private readonly onReady?: () => void;

  private readonly images: HTMLImageElement[] = [];
  private currentFrame = -1;
  private rafId = 0;
  private ticking = false;
  private readonly reducedMotion: boolean;

  constructor(opts: ScrollFramesOptions) {
    const ctx = opts.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('ScrollFrames: 2D-контекст недоступен');

    this.section = opts.section;
    this.canvas = opts.canvas;
    this.ctx = ctx;
    this.frameCount = opts.frameCount;
    this.framePath = opts.framePath;
    this.onProgress = opts.onProgress;
    this.onReady = opts.onReady;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  public init(): void {
    this.resizeCanvas();

    // При reduced-motion грузим только первый кадр и не вешаем скролл.
    const framesToLoad = this.reducedMotion ? 1 : this.frameCount;

    let loaded = 0;
    for (let i = 0; i < this.frameCount; i += 1) {
      const img = new Image();
      this.images[i] = img;

      if (i < framesToLoad) {
        img.decoding = 'async';
        img.onload = () => {
          loaded += 1;
          this.onProgress?.(loaded, framesToLoad);
          if (i === 0) this.render(0); // показать первый кадр как можно раньше
          if (loaded === framesToLoad) this.handleReady();
        };
        img.onerror = () => {
          loaded += 1;
          if (loaded === framesToLoad) this.handleReady();
        };
        img.src = this.framePath(i);
      }
    }
  }

  private handleReady(): void {
    this.onReady?.();
    if (this.reducedMotion) {
      this.render(0);
      return;
    }
    this.bindEvents();
    this.update(); // отрисовать кадр под текущую позицию скролла
  }

  private bindEvents(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    this.rafId = window.requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  };

  private readonly onResize = (): void => {
    this.resizeCanvas();
    this.currentFrame = -1; // форсируем перерисовку
    this.update();
  };

  /** Прогресс прохождения секции 0..1. */
  private computeProgress(): number {
    const rect = this.section.getBoundingClientRect();
    const distance = this.section.offsetHeight - window.innerHeight;
    if (distance <= 0) return 0;
    return clamp(-rect.top / distance, 0, 1);
  }

  private update(): void {
    const progress = this.computeProgress();
    const frame = Math.round(progress * (this.frameCount - 1));
    if (frame === this.currentFrame) return;
    this.render(frame);
  }

  private render(frame: number): void {
    const img = this.images[frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    this.currentFrame = frame;
    this.drawCover(img);
  }

  /** Отрисовка с вписыванием (object-fit: contain) по центру. */
  private drawCover(img: HTMLImageElement): void {
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, dw, dh);

    // Заплатка поверх вотермарки KlingAI (правый нижний угол, 210×65px в оригинале)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(
      dx + dw - 210 * scale,
      dy + dh - 65 * scale,
      210 * scale,
      65 * scale,
    );
  }

  private resizeCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    // координаты рисуем в CSS-пикселях
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public destroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    if (this.rafId) window.cancelAnimationFrame(this.rafId);
  }
}
