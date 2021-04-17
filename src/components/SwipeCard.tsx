import classNames from 'classnames/bind';
import React, { PureComponent, ReactNode } from 'react';
import {maxBy} from 'lodash'

export type Side = "left" | "right" | "up" | "down"
export type DetectionMethod = "speed" | "pos"
export type SwipeDetection = {certainty: number, side : Side, detectionMethod : DetectionMethod}

type Props = {
  /* 'e' may be null if swipe simulate with swipe(side) method */
  onSwipe: (e: React.TouchEvent<HTMLDivElement> | null, side: Side) => void
  onAboutToSwipe: (e: React.TouchEvent<HTMLDivElement> | null, side: Side, coef: number) => void
  children: ReactNode
  [x: string]: any
  enableSwipe?: Side[]
}

interface State { count: number, show: boolean }

const deltaThreshold = 0.60
const speedThreshold = 0.9

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

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0,
      show: true
    }
    this.ref = React.createRef<HTMLDivElement>()
  }

  render() {
    const { onSwipe, enableSwipe, ...remains } = this.props
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
    //console.log({ fingerAdded: e });
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

      const swipes : SwipeDetection[] = [
        {
          side: "right", detectionMethod: "pos",
          certainty: (deltaX / target.clientWidth) / deltaThreshold
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
          certainty: Math.abs(this.speedX) / speedThreshold
        },
        {
          side: "left", detectionMethod: "speed",
          certainty: Math.abs(this.speedX) / -speedThreshold
        },
        {
          side: "up", detectionMethod: "speed",
          certainty: Math.abs(this.speedY) / -speedThreshold
        },
        {
          side: "down", detectionMethod: "speed",
          certainty: Math.abs(this.speedY) / speedThreshold
        },
      ]
      const bestMatch = maxBy(swipes, swipe => swipe.certainty)
      console.log(bestMatch);
      this.previous = this.current
      this.current = { deltaX, deltaY, confirmation, time }
    }
    //console.log({ moving: e });
  }

  fingerRemoved(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    if (target != null) {
      const posSwipeTriggered = Math.abs(this.current.deltaX) / target.clientWidth > deltaThreshold ||
        Math.abs(this.current.deltaY) / target.clientHeight > deltaThreshold
      const speedSwipeTriggered = Math.abs(this.speedX) > speedThreshold || Math.abs(this.speedY) > speedThreshold

      //Swipe
      if (posSwipeTriggered) {
        if (Math.abs(this.current.deltaX) / target.clientWidth > Math.abs(this.current.deltaY / target.clientHeight)) {
          //X prevail
          const sign = Math.sign(this.current.deltaX)
          const finalAnimationPos = target.clientWidth * 2 * sign;
          const side = sign > 0 ? "right" : "left"
          if (this.props.enableSwipe?.includes(side)) {
            this.props.onSwipe(e, side)
            this.swiped = true;
            target.style.transition = `transform 0.3s ease`;
            const angle = finalAnimationPos * 0.05;
            target.style.transform = `translateX(${finalAnimationPos}px) rotate(${angle}deg)`;
          } else {
            this.reset(target)
          }
        } else {
          //Y prevail
          const sign = Math.sign(this.current.deltaY)
          const finalAnimationPos = target.clientHeight * 2 * sign
          const side = sign > 0 ? "down" : "up"
          if (this.props.enableSwipe?.includes(side)) {
            this.props.onSwipe(e, side)
            this.swiped = true;
            target.style.transition = `transfor m 0.3s ease`;
            const angle = finalAnimationPos * 0.05;
            target.style.transform = `translateY(${finalAnimationPos}px) rotate(${angle}deg)`;
          } else {
            this.reset(target)
          }
        }
      } else if (speedSwipeTriggered) {
        if (Math.abs(this.speedX) > Math.abs(this.speedY)) {
          //X prevail
          const sign = Math.sign(this.speedX);
          const finalAnimationPos = target.clientWidth * 2 * sign
          const side = sign > 0 ? "right" : "left"
          if (this.props.enableSwipe?.includes(side)) {
            this.props.onSwipe(e, side)
            this.swiped = true;
            target.style.transition = `transform ${1 / Math.abs(this.speedX)}s ease`;
            target.style.transform = `translateX(${finalAnimationPos}px)`;
          } else {
            this.reset(target)
          }
        } else {
          //Y prevail
          // console.log({this.speedY})
          const sign = Math.sign(this.speedY);
          const finalAnimationPos = target.clientHeight * 2 * sign
          const side = sign > 0 ? "down" : "up"
          if (this.props.enableSwipe?.includes(side)) {
            this.props.onSwipe(e, side)
            this.swiped = true;
            target.style.transition = `transform ${1 / Math.abs(this.speedY)}s ease`;
            target.style.transform = `translateY(${finalAnimationPos}px)`;
          } else {
            this.reset(target)
          }
        }

      } else {
        //Reset to original position
        this.reset(target)
      }
    }
    //console.log({ fingerRemoved: e });
  }

  swipe(side: Side) {
    const target = this.ref.current;
    if (["right", "left"].includes(side) && target != null) {
      const sign = side === "right" ? 1 : -1
      const finalAnimationPos = target.clientWidth * 2 * sign
      if (this.props.enableSwipe?.includes(side)) {
        this.props.onSwipe(null, side)
        this.swiped = true;
        target.style.transition = `transform 0.3s ease`;
        const angle = finalAnimationPos * 0.05;
        target.style.transform = `translateX(${finalAnimationPos}px) rotate(${angle}deg)`;
      }
    } else if (["up", "down"].includes(side) && target != null) {
      const sign = side === "down" ? 1 : -1
      const finalAnimationPos = target.clientWidth * 3 * sign
      if (this.props.enableSwipe?.includes(side)) {
        this.props.onSwipe(null, side)
        this.swiped = true;
        target.style.transition = `transform 0.3s ease`;
        target.style.transform = `translateY(${finalAnimationPos}px)`;
      }
    } else {
      console.warn("Swipe action called before ref initialized")
    }
  }


  reset(target: HTMLDivElement | null = null) {
    target = target || this.ref.current
    if (target) {
      target.style.transition = `transform ${0.3}s ease`;
      target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
    }
  }

  hide(e: React.TransitionEvent<HTMLDivElement>) {
    //console.log("aniamtion end")
    //this.swiped && this.setState({ show: false });
  }


}

export default SwipeCard