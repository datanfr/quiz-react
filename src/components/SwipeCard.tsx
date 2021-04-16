import classNames from 'classnames/bind';
import React, { PureComponent, ReactNode } from 'react';

type Side = "left" | "right" | "up" | "down"

type Props = {
  onSwipe: (e: React.TouchEvent<HTMLDivElement>, side: Side) => void
  children: ReactNode
  [x: string]: any
  enableSwipe?: Side[]
}

interface State { count: number, show: boolean }

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
    const { onSwipe, enableSwipe, ...remains } = this.props
    return this.state.show && <div {...remains}
      onTouchStart={e => this.fingerAdded(e)}
      onTouchMove={e => this.moving(e)}
      onTouchEnd={e => this.fingerRemoved(e)}
      onTransitionEnd={e => this.hide(e)}>
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
    if (e.currentTarget != null && this.startEvent != null) {
      const time = performance.now()
      const deltaX = e.touches[0].clientX - this.startEvent.touches[0].clientX;
      const deltaY = e.touches[0].clientY - this.startEvent.touches[0].clientY;
      const angleX = deltaX * 0.05;
      const angleY = deltaY * 0.05;
      const confirmation = deltaX / e.currentTarget.clientWidth;
      this.speedX = (deltaX - this.previous.deltaX) / (time - this.previous.time)//In pixel per millisecond
      this.speedY = (deltaY - this.previous.deltaY) / (time - this.previous.time)//In pixel per millisecond
      //console.log({speed: this.speed});
      const tranform = `translate(${Math.round(deltaX)}px, ${Math.round(deltaY)}px) rotateZ(${angleX}deg) rotateX(${-angleY}deg)`;
      //console.log({ tranform });
      e.currentTarget.style.transform = tranform;
      this.previous = this.current
      this.current = { deltaX, deltaY, confirmation, time }
    }
    //console.log({ moving: e });
  }

  fingerRemoved(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    if (target != null) {
      const deltaThreshold = 0.60
      const speedThreshold = 0.9
      const posSwipeTriggered = Math.abs(this.current.deltaX) / target.clientWidth > deltaThreshold ||
        Math.abs(this.current.deltaY) / target.clientHeight > deltaThreshold
      const speedSwipeTriggered = Math.abs(this.speedX) > speedThreshold || Math.abs(this.speedY) > speedThreshold
      // console.log({
      //   deltaX: this.current.deltaX, width: target.clientWidth, speed: this.speed,
      //   deltaXSign: Math.sign(this.current.deltaX), speedSign: Math.sign(this.speed)
      // })

      if ((posSwipeTriggered || speedSwipeTriggered) /*&& Math.sign(this.current.deltaX) === Math.sign(this.speed)*/) {
        //Swipe
        console.log(this.current)
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
              target.style.transition = `transform 0.3s ease`;
              const angle = finalAnimationPos * 0.05;
              target.style.transform = `translateY(${finalAnimationPos}px) rotate(${angle}deg)`;
            } else {
              this.reset(target)
            }
          }
        } else {
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
        }
      } else {
        //Reset to original position
        this.reset(target)
      }
    }
    //console.log({ fingerRemoved: e });
  }

  reset(target: HTMLDivElement) {
    target.style.transition = `transform ${0.3}s ease`;
    target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
  }

  hide(e: React.TransitionEvent<HTMLDivElement>) {
    //console.log("aniamtion end")
    this.swiped && this.setState({ show: false });
  }


}

export default SwipeCard