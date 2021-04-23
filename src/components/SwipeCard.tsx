import classNames from 'classnames/bind';
import React, { PureComponent, ReactNode } from 'react';
import { isNull, maxBy } from 'lodash'

export type Side = "left" | "right" | "up" | "down"
export type DetectionMethod = "speed" | "pos"
export type SwipeDetection = { certainty: number, side: Side, detectionMethod: DetectionMethod }

type Props = {
  /* 'e' may be null if swipe simulate with swipe(side) method */
  onSwipe: (e: React.TouchEvent<HTMLDivElement> | null, side: Side) => void
  onAboutToSwipe?: (e: React.TouchEvent<HTMLDivElement> | null, swipe: SwipeDetection) => void
  onReset?: () => void
  children: ReactNode
  [x: string]: any
  enableSwipe?: Side[]
}

interface State { count: number, show: boolean }

const deltaThreshold = 0.60
const speedThreshold = 0.3

const animationSpeed = 0.7

const animationEnd: Record<Side, {
  transform: (clientWidth: number, clientHeight: number) => string,
  transition: Record<DetectionMethod, (speedX: number, speedY: number) => string>
}> = {
  right: {
    transition: {
      speed: (speedX, speedY) => `transform ${animationSpeed}s ease`,
      pos: (speedX, speedY) => `transform ${animationSpeed}s ease`
    },
    transform: (clientWidth, clientHeight) => `translateX(${clientWidth * 2}px) rotate(${clientWidth * 2 * 0.05}deg)`
  },
  left: {
    transition: {
      speed: (speedX, speedY) => `transform ${animationSpeed}s ease`,
      pos: (speedX, speedY) => `transform ${animationSpeed}s ease`
    },
    transform: (clientWidth, clientHeight) => `translateX(${-clientWidth * 2}px) rotate(${-clientWidth * 2 * 0.05}deg)`
  },
  up: {
    transition: {
      speed: (speedX, speedY) => `transform ${animationSpeed}s ease`,
      pos: (speedX, speedY) => `transform ${animationSpeed}s ease`
    },
    transform: (clientWidth, clientHeight) => `translateY(${-clientHeight * 3}px)`
  },
  down: {
    transition: {
      speed: (speedX, speedY) => `transform ${animationSpeed}s ease`,
      pos: (speedX, speedY) => `transform ${animationSpeed}s ease`
    },
    transform: (clientWidth, clientHeight) => `translateY(${clientHeight * 3}px)`
  },
}

class SwipeCard extends PureComponent<Props, State> {

  startEvent: React.TouchEvent<HTMLDivElement> | null = null;

  previous = {
    deltaX: 0,
    deltaY: 0,
    confirmation: 0,
    time: 0
  }

  current = {
    deltaX: 0,
    deltaY: 0,
    confirmation: 0,
    time: 0
  }

  speedX = 0;
  speedY = 0;
  swiped = false;
  side: Side | null = null;
  sideCertainty = 0;

  ref: React.RefObject<HTMLDivElement>;
  bestMatch: SwipeDetection | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0,
      show: true
    }
    this.ref = React.createRef<HTMLDivElement>()
  }

  render() {
    const { onSwipe, onAboutToSwipe, enableSwipe, ...remains } = this.props
    return this.state.show && <div {...remains}
      onTouchStart={e => this.fingerAdded(e)}
      onTouchMove={e => this.moving(e)}
      onTouchEnd={e => this.fingerRemoved(e)}
      onTransitionEnd={e => this.hide(e)}
      ref={this.ref}
    >
      {this.props.children}
    </div>
  }

  fingerAdded(e: React.TouchEvent<HTMLDivElement>) {
    this.startEvent = e;
    if (e.currentTarget != null) {
      e.currentTarget.style.transition = `none`;
    }
  }

  moving(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget
    if (target != null && this.startEvent != null) {
      const time = performance.now()
      const deltaX = e.touches[0].clientX - this.startEvent.touches[0].clientX;
      const deltaY = e.touches[0].clientY - this.startEvent.touches[0].clientY;
      const angleX = deltaX * 0.05;
      const angleY = deltaY * 0.05;
      const confirmation = deltaX / target.clientWidth;
      this.speedX = (deltaX - this.previous.deltaX) / (time - this.previous.time)//In pixel per millisecond
      this.speedY = (deltaY - this.previous.deltaY) / (time - this.previous.time)//In pixel per millisecond
      const tranform = `translate(${Math.round(deltaX)}px, ${Math.round(deltaY)}px) rotateZ(${angleX}deg) rotateX(${-angleY}deg)`;
      target.style.transform = tranform;

      const swipes: SwipeDetection[] = [
        {
          side: "right", detectionMethod: "pos",
          certainty: (deltaX / target.clientWidth) / deltaThreshold,
        },
        {
          side: "left", detectionMethod: "pos",
          certainty: (deltaX / target.clientWidth) / -deltaThreshold
        },
        {
          side: "up", detectionMethod: "pos",
          certainty: (deltaY / target.clientHeight) / -deltaThreshold
        },
        {
          side: "down", detectionMethod: "pos",
          certainty: (deltaY / target.clientHeight) / deltaThreshold
        },
        {
          side: "right", detectionMethod: "speed",
          certainty: this.speedX / speedThreshold
        },
        {
          side: "left", detectionMethod: "speed",
          certainty: this.speedX / -speedThreshold
        },
        {
          side: "up", detectionMethod: "speed",
          certainty: this.speedY / -speedThreshold
        },
        {
          side: "down", detectionMethod: "speed",
          certainty: this.speedY / speedThreshold
        },
      ]
      this.bestMatch = maxBy(swipes, swipe => swipe.certainty)
      if (this.bestMatch && this.props.onAboutToSwipe) this.props.onAboutToSwipe(e, this.bestMatch)
      this.previous = this.current
      this.current = { deltaX, deltaY, confirmation, time }
    }
  }

  fingerRemoved(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    if (this.bestMatch && this.bestMatch.certainty > 1) {
      const { side, detectionMethod } = this.bestMatch
      if (!this.props.enableSwipe || this.props.enableSwipe?.includes(side)) {
        this.props.onSwipe(e, this.bestMatch.side)
        this.swiped = true;
        target.style.transition = animationEnd[side].transition[detectionMethod](this.speedX, this.speedY)
        target.style.transform = animationEnd[side].transform(target.clientWidth, target.clientHeight)
      } else {
        this.reset(target)
      }
    } else {
      //Reset to original position
      this.reset(target)
    }
  }

  swipe(side: Side) {
    const target = this.ref.current;
    if (target != null) {
      this.props.onSwipe(null, side)
      this.swiped = true;
      target.style.transition = animationEnd[side].transition["pos"](this.speedX, this.speedY)
      target.style.transform = animationEnd[side].transform(target.clientWidth, target.clientHeight)
    } else {
      //Reset to original position
      this.reset(target)
    }
  }


  reset(target: HTMLDivElement | null = null) {
    target = target || this.ref.current
    if (target) {
      target.style.transition = `transform ${0.3}s ease`;
      target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
    }
    this.props.onReset && this.props.onReset()
  }

  hide(e: React.TransitionEvent<HTMLDivElement>) {
    //this.swiped && this.setState({ show: false });
  }


}

export default SwipeCard