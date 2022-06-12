export interface FrameRateCalculatorProps {
  windowSizeMS?: FrameRateCalculator["windowSizeMS"];
  callback?: FrameRateCalculator["callback"]
}

const DEFAULT_PROPS: FrameRateCalculatorProps = {
  windowSizeMS: 1000,
};

/**
 * Counts frames per second.
 */
class FrameRateCalculator {
  // We determine when to evict the oldest timestamps based on time window
  windowSizeMS: number;

  // You may pass a callback that is invoked with the lastest flps
  callback: (fps: number | null) => any;

  frameTimestamps: DOMHighResTimeStamp[] = [];

  constructor(props?: FrameRateCalculatorProps) {
    const { windowSizeMS, callback } = { ...DEFAULT_PROPS, ...props };

    this.windowSizeMS = windowSizeMS;
    this.callback = callback;

    this.count = this.count.bind(this);
  }

  start() {
    this.frameTimestamps.push(performance.now());
    requestAnimationFrame(this.count);
  }

  count(timestamp: DOMHighResTimeStamp) {
    this.nextFrame(timestamp);
    this.callback(this.getFPS());
    requestAnimationFrame(this.count);
  }

  /**
     * @param deltaT Seconds elapsed since last frame.
     */
  nextFrameDelta(deltaT: DOMHighResTimeStamp) {
    const nextTimestamp = this.frameTimestamps[this.frameTimestamps.length - 1] + deltaT;
    this.nextFrame(nextTimestamp);
  }

  nextFrame(timestamp: DOMHighResTimeStamp) {
    this.frameTimestamps.push(timestamp);
    this.evictTimestamps();
  }

  getFPS() {
    if (this.frameTimestamps.length <= 1) {
      return null;
    }

    const numFrames = this.frameTimestamps.length;
    const secondsElapsed = (this.getCurrentFrame() - this.getOldestFrame()) / 1000;

    return (numFrames / secondsElapsed);
  }

  private evictTimestamps() {
    while (this.frameTimestamps.length > 1) {
      if (this.getCurrentFrame() - this.getOldestFrame() > this.windowSizeMS) {
        this.frameTimestamps.shift();
      } else {
        break;
      }
    }
  }

  private getCurrentFrame() {
    return this.frameTimestamps[this.frameTimestamps.length - 1];
  }

  private getOldestFrame() {
    return this.frameTimestamps[0];
  }
}

export default FrameRateCalculator;
