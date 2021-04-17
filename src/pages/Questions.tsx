import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import SwipeCard, { Side } from "../components/SwipeCard"
import React, { Fragment } from 'react';

let cx = classNames.bind(classes);

type Card = {
    titre: string
    content: string
    swiped?: string
    ref?: React.RefObject<SwipeCard>
}

const cards: Card[] = [
    { "titre": "environnement (1/6)", "content": "coucou", ref: React.createRef() },
    { "titre": "environnement (2/6)", "content": "hola", ref: React.createRef() },
    { "titre": "environnement (3/6)", "content": "hello", ref: React.createRef() }
];

(window as any).cards = cards

function onSwipe(e: React.TouchEvent<HTMLDivElement> | null, side: String, card: Card) {
    Object.assign(card, { swiped: side })
    if (cards.every(x => x.swiped)) {
        console.log("All card swiped !", cards)
    }
}

function resetLastCard() {
    const lastCard = cards.slice().reverse().find(x => x.swiped)//Find last swiped
    delete lastCard?.swiped
    lastCard && lastCard.ref && lastCard.ref.current?.reset()
}

function swipeTopCard(side: Side) {
    const topCard = cards.find(x => !x.swiped)//Find first unswipped card
    console.log({ simulateSwipe: side, topCard })
    topCard && topCard.ref && topCard.ref.current?.swipe(side)
}

Object.assign((window as any), { cards, resetLastCard, swipeTopCard });

const Questions: React.FC = () => {
    return (
        <div className={cx("container", "page")}>
            <div className={cx("container", "back-button")}>
                <FontAwesomeIcon icon={faChevronLeft} onClick={() => resetLastCard()} />
            </div>
            <div className={cx("container", "title")}>Environnement</div>
            <div className={cx("container", "cards")}>
                <div className={cx("card-stack")}>
                    {cards.slice().reverse().map(card => <SwipeCard
                        enableSwipe={['right', 'left', 'up']}
                        className={cx("card")}
                        key={card.titre}
                        ref={card.ref}
                        onSwipe={(e, side) => onSwipe(e, side, card)}
                    >
                        <div className={cx('card-content')}>
                            {card.titre}<br />
                            Hello i'm swipe card content<br />
                            {card.content}<br />
                        </div>
                        <div className={cx('card-stamp', 'stamp-right')}>
                            <div style={{
                                color: "green",
                                fontSize:"3em",
                                transform: "translate(5px, 200px) rotate(35deg)", border: "5px solid green", borderRadius: "15px"}}>POUR</div>
                        </div>
                        <div className={cx('card-stamp', 'stamp-left')}>
                            <div style={{
                                color: "red",
                                fontSize:"2em",
                                transform: "translate(113px, 283px) rotate(-35deg)", border: "5px solid red", borderRadius: "15px"}}>CONTRE</div>
                        </div>
                        <div className={cx('card-stamp', 'stamp-up')}>
                            <div style={{
                                color: "grey",
                                fontSize:"3em",
                                transform: "translate(52px, 297px) rotate(-9deg)", border: "5px solid grey", borderRadius: "15px"}}>OSEF</div>
                        </div>
                    </SwipeCard>)}
                </div>
            </div>
            <div className={cx("container", "buttons")}>
                <div
                    className={cx("container", "button")}
                    data-value="{'importance': 1, 'pour': -1}"
                    onClick={e => swipeTopCard("left")}
                >
                    Contre
                </div>
                <div
                    className={cx("container", "button")}
                    data-value="{'importance': 0, 'pour': 0}"
                    onClick={e => swipeTopCard("up")}
                >
                    OSEF
                </div>
                <div
                    className={cx("container", "button")}
                    data-value="{'importance': 1, 'pour': 1}"
                    onClick={e => swipeTopCard("right")}>
                    Pour
                </div>
            </div>
        </div>
    );
};

export default Questions;
