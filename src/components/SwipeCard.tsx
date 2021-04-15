import classNames from 'classnames/bind';
import React, { PureComponent, ReactNode } from 'react';
import classes from './SwipeCard.module.css';

let cx = classNames.bind(classes);

export type Card = {
  titre: string,
  content: string
}

interface Props {
  onSwipe: (e: React.TouchEvent<HTMLDivElement>, side: String, card: Card) => void,
  cards: Card[],
  children: (elem: SwipeCard, card: Card) => ReactNode;
}

interface State { count: number }

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
      count: 0
    }
    this.ref = React.createRef<HTMLElement>()
  }

  render() {
    const { cards, onSwipe, ...remains } = this.props
    return cards.map(x => <div className={cx("swipe-card")} key={x.titre}
      onTouchStart={e => this.fingerAdded(e)}
      onTouchMove={e => this.moving(e)}
      onTouchEnd={e => this.fingerRemoved(e)}
      onTransitionEnd={e => this.reset(e)}>
      {this.props.children(this, x)}
    </div>)
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
      const confirmation = this.current.deltaX / target.clientWidth;
      const speedSign = this.speed > 0 ? 1 : -1
      const finalAnimationPos = target.clientWidth * 2 * speedSign
      const angle = finalAnimationPos * 0.05;
      if (
        //confirmation < deltaThreshold && confirmation > -deltaThreshold &&
        this.speed < speedThreshold && this.speed > -speedThreshold
      ) {
        target.style.transition = `transform ${0.3}s ease`;
        target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
      } else {
        target.style.transition = `transform ${1 / Math.abs(this.speed)}s ease`;
        target.style.transform = `translateX(${finalAnimationPos}px) rotate(${angle}deg)`;
        this.props.onSwipe(e, speedSign > 0 ? "right" : "left", this.props.cards[this.currentCard])
        this.currentCard++;
      }
    }
    console.log({ fingerRemoved: e });
  }

  reset(e: React.TransitionEvent<HTMLDivElement>) {
    console.log("aniamtion end")
    const target = e.currentTarget
    if (target != null) {
      target.style.transition = `none`;
      target.style.transform = `translateX(${0}px) rotate(${0}deg)`;
    }
  }


}

export default SwipeCard