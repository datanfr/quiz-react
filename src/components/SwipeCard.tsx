import classNames from 'classnames/bind';
import React, { PureComponent, ReactNode } from 'react';

type Props = {
  onSwipe: (e: React.TouchEvent<HTMLDivElement>, side: "left" | "right") => void
  children: ReactNode
  [x: string]: any
}

interface State { count: number, show: boolean }

class SwipeCard extends PureComponent<Props, State> {

  startEvent: React.TouchEvent<HTMLDivElement> | null = null;

  previous = {
    deltaX: 0,
    confirmation: 0,
    time: 0
  }

  current = {
    deltaX: 0,
    confirmation: 0,
    time: 0
  }

  speed = 0;
  currentCard = 0;

  ref: React.RefObject<HTMLElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      count: 0,
      show: true
    }
    this.ref = React.createRef<HTMLElement>()
  }

  render() {
    const {onSwipe, ...remains } = this.props
    return this.state.show && <div {...remains}
      onTouchStart={e => this.fingerAdded(e)}
      onTouchMove={e => this.moving(e)}
      onTouchEnd={e => this.fingerRemoved(e)}
      onTransitionEnd={e => this.reset(e)}>
      {this.props.children}
    </div>
  }

  fingerAdded(e: React.TouchEvent<HTMLDivElement>) {
    this.startEvent = e;
    if (e.currentTarget != null) {
      e.currentTarget.style.transition = `none`;
    }
    console.log({ fingerAdded: e });
  }

  moving(e: React.TouchEvent<HTMLDivElement>) {
    if (e.currentTarget != null && this.startEvent != null) {
      const time = performance.now()
      const deltaX = e.touches[0].clientX - this.startEvent.touches[0].clientX;
      const deltaY = e.touches[0].clientY - this.startEvent.touches[0].clientY;
      const angle = deltaX * 0.05;
      const confirmation = deltaX / e.currentTarget.clientWidth;
      this.speed = (deltaX - this.previous.deltaX) / (time - this.previous.time)//In pixel per millisecond
      //console.log({speed: this.speed});
      const tranform = `translateX(${Math.round(deltaX)}px) rotate(${angle}deg)`;
      //console.log({ tranform });
      e.currentTarget.style.transform = tranform;
      this.previous = this.current
      this.current = { deltaX, confirmation, time }
    }
    //console.log({ moving: e });
  }

  fingerRemoved(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    if (target != null) {
      const deltaThreshold = 0.60
      const speedThreshold = 0.9
      const posSwipeTriggered = Math.abs(this.current.deltaX) / target.clientWidth > deltaThreshold
      const speedSwipeTriggered = Math.abs(this.speed) > speedThreshold
      console.log({
        deltaX: this.current.deltaX, width: target.clientWidth, speed: this.speed,
        deltaXSign: Math.sign(this.current.deltaX), speedSign: Math.sign(this.speed)
      })
  
      if ((posSwipeTriggered  || speedSwipeTriggered) /*&& Math.sign(this.current.deltaX) === Math.sign(this.speed)*/) {
        //Swipe
        let finalAnimationPos;
        if (posSwipeTriggered) {
          const sign = Math.sign(this.current.deltaX)
          finalAnimationPos = target.clientWidth * 2 * sign
          this.props.onSwipe(e, sign > 0 ? "right" : "left")
          target.style.transition = `transform 0.3s ease`;
        } else {
          const sign = Math.sign(this.speed);
          finalAnimationPos = target.clientWidth * 2 * sign
          this.props.onSwipe(e, sign > 0 ? "right" : "left")
          target.style.transition = `transform ${1 / Math.abs(this.speed)}s ease`;
        }
        const angle = finalAnimationPos * 0.05;
        target.style.transform = `translateX(${finalAnimationPos}px) rotate(${angle}deg)`;
        this.currentCard++;
      } else {
        //Reset to original position
        target.style.transition = `transform ${0.3}s ease`;
        target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
      }
    }
    console.log({ fingerRemoved: e });
  }

  reset(e: React.TransitionEvent<HTMLDivElement>) {
    console.log("aniamtion end")
    this.setState({show: false});
  }


}

export default SwipeCard