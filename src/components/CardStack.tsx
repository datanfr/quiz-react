import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './CardStack.module.css';
import SwipeCard, { Side, SwipeDetection } from "./SwipeCard"
import React, { Component, Fragment, PureComponent, ReactChild, ReactChildren, useState } from 'react';

export type Choice = "pour" | "contre" | "osef"

export type Card = {
    cardData: any
    swiped?: string
    ref?: React.RefObject<SwipeCard>,
    stamps: Record<Choice, React.RefObject<HTMLDivElement>>
}

interface Props<T> { cardsData: T[], children: (cardData:T) => ReactChild | ReactChildren  }
interface State {}

let cx = classNames.bind(classes);

const sideToChoice: Record<Side, Choice | null> = {
    "right": "pour",
    "left": "contre",
    "up": "osef",
    "down": null
};

function createStampsRef(): Record<Choice, React.RefObject<HTMLDivElement>> {
    return {
        ["pour"]: React.createRef<HTMLDivElement>(),
        ["contre"]: React.createRef<HTMLDivElement>(),
        ["osef"]: React.createRef<HTMLDivElement>()
    }
}

class CardStack<T> extends PureComponent<Props<T>, State> {

    cards: Card[]

    constructor(props: Props<T>) {
        super(props)
        this.cards = this.props.cardsData.map(cardData => ({
            cardData, ref: React.createRef(), stamps: createStampsRef()
        }))

    }

    onSwipe(e: React.TouchEvent<HTMLDivElement> | null, side: Side, card: Card) {
        Object.assign(card, { swiped: side })
        if (this.cards.every(x => x.swiped)) {
            console.log("All card swiped !", this.cards)
        }
    }

    onAboutToSwipe(e: React.TouchEvent<HTMLDivElement> | null, swipe: SwipeDetection, card: Card) {
        const choice = sideToChoice[swipe.side]
        if (card.stamps.contre.current) card.stamps.contre.current.style.opacity = "0";
        if (card.stamps.pour.current) card.stamps.pour.current.style.opacity = "0";
        if (card.stamps.osef.current) card.stamps.osef.current.style.opacity = "0";
        if (choice != null) {
            const targetStamp = card.stamps[choice].current
            //console.log(targetStamp)
            if (targetStamp) targetStamp.style.opacity = swipe.certainty.toString();
        }
    }

    onReset(card: Card) {
        if (card.stamps.contre.current) card.stamps.contre.current.style.opacity = "0";
        if (card.stamps.pour.current) card.stamps.pour.current.style.opacity = "0";
        if (card.stamps.osef.current) card.stamps.osef.current.style.opacity = "0";
    }

    resetLastCard() {
        const lastCard = this.cards.slice().reverse().find(x => x.swiped)//Find last swiped
        delete lastCard?.swiped
        lastCard && lastCard.ref && lastCard.ref.current?.reset()
    }

    swipeTopCard(side: Side) {
        const topCard = this.cards.find(x => !x.swiped)//Find first unswipped card
        console.log({ simulateSwipe: side, topCard })
        const choice = sideToChoice[side]
        const stamp = choice && topCard?.stamps[choice].current
        if (stamp) stamp.style.opacity = "1";
        topCard && topCard.ref && topCard.ref.current?.swipe(side)
    }

    render() {
        return (
            <div className={cx("card-stack")}>
                {this.cards.slice().reverse().map((card, i) => <SwipeCard
                    enableSwipe={['right', 'left', 'up']}
                    className={cx("card")}
                    ref={card.ref}
                    onSwipe={(e, side) => this.onSwipe(e, side, card)}
                    onAboutToSwipe={(e, swipe) => this.onAboutToSwipe(e, swipe, card)}
                    onReset={() => this.onReset(card)}
                >
                    <div className={cx('card-content')}>
                        {this.props.children(card.cardData)}
                    </div>
                    <div ref={card.stamps.pour} className={cx('card-stamp', 'pour')}>
                        <div>POUR</div>
                    </div>
                    <div ref={card.stamps.contre} className={cx('card-stamp', 'contre')}>
                        <div>CONTRE</div>
                    </div>
                    <div ref={card.stamps.osef} className={cx('card-stamp', 'osef')}>
                        <div>NE SAIT PAS</div>
                    </div>
                </SwipeCard>)}
            </div>
        );
    }
};

export default CardStack;
