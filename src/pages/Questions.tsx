import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import SwipeCard, { Side, SwipeDetection } from "../components/SwipeCard"
import React, { Fragment, PureComponent, useState } from 'react';
import Api from '../Api';
import { initialize } from 'workbox-google-analytics';

export type Choice = "pour" | "contre" | "osef"

export type Card = {
    apiData: any
    swiped?: string
    ref?: React.RefObject<SwipeCard>,
    stamps: Record<Choice, React.RefObject<HTMLDivElement>>
}

interface Props { }
interface State { cards: Card[] }

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

class Questions extends PureComponent<Props, State> {

    apiCall : Promise<any[]>

    constructor(props: Props) {
        super(props)
        this.apiCall = Api.getCards('environnement', 5)
        this.state = {
            cards: []
        }
    }

    componentDidMount() {
        this.apiCall
            .then(
                resp => this.handleApiResponse(resp),
                e => this.handleApiError(e)
            )
    }

    handleApiResponse(resp: any[]) {
        const cards: Card[] = resp.map(apiData => ({
            apiData, ref: React.createRef(), stamps: createStampsRef()
        }))
        this.setState({ cards })
    }

    handleApiError(e: Error) {
        console.log("Error caught putting fake cards data", e)
        const cards = [
            {
                apiData: { "voteTitre": "environnement (1/6)", "description": "coucou" },
                ref: React.createRef<SwipeCard>(),
                stamps: createStampsRef()
            },
            {
                apiData: { "voteTitre": "environnement (2/6)", "description": "hola" },
                ref: React.createRef<SwipeCard>(),
                stamps: createStampsRef()
            },
            {
                apiData: { "voteTitre": "environnement (3/6)", "description": "hello" },
                ref: React.createRef<SwipeCard>(),
                stamps: createStampsRef()
            }
        ]
        this.setState({ cards })
    }

    onSwipe(e: React.TouchEvent<HTMLDivElement> | null, side: Side, card: Card) {
        Object.assign(card, { swiped: side })
        if (this.state.cards.every(x => x.swiped)) {
            console.log("All card swiped !", this.state.cards)
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
        const lastCard = this.state.cards.slice().reverse().find(x => x.swiped)//Find last swiped
        delete lastCard?.swiped
        lastCard && lastCard.ref && lastCard.ref.current?.reset()
    }

    swipeTopCard(side: Side) {
        const topCard = this.state.cards.find(x => !x.swiped)//Find first unswipped card
        console.log({ simulateSwipe: side, topCard })
        const choice = sideToChoice[side]
        const stamp = choice && topCard?.stamps[choice].current
        if (stamp) stamp.style.opacity = "1";
        topCard && topCard.ref && topCard.ref.current?.swipe(side)
    }


    render() {
        //console.log("rendering", this.state.cards)
        return (
            <div className={cx("container", "page")}>
                <div className={cx("container", "back-button")}>
                    <FontAwesomeIcon icon={faChevronLeft} onClick={() => this.resetLastCard()} />
                </div>
                <div className={cx("container", "title")}>Environnement</div>
                <div className={cx("container", "cards")}>
                    <div className={cx("card-stack")}>
                        {this.state.cards.slice().reverse().map(card => <SwipeCard
                            enableSwipe={['right', 'left', 'up']}
                            className={cx("card")}
                            key={card.apiData.voteTitre}
                            ref={card.ref}
                            onSwipe={(e, side) => this.onSwipe(e, side, card)}
                            onAboutToSwipe={(e, swipe) => this.onAboutToSwipe(e, swipe, card)}
                            onReset={() => this.onReset(card)}
                        >
                            <div className={cx('card-content')}>
                                {card.apiData.voteTitre}<br />
                            Hello i'm swipe card content<br />
                                {card.apiData.description}<br />
                            </div>
                            <div ref={card.stamps.pour} className={cx('card-stamp', 'stamp-right')}>
                                <div style={{
                                    color: "green",
                                    fontSize: "3em",
                                    transform: "translate(5px, 200px) rotate(35deg)", border: "5px solid green", borderRadius: "15px"
                                }}>POUR</div>
                            </div>
                            <div ref={card.stamps.contre} className={cx('card-stamp', 'stamp-left')}>
                                <div style={{
                                    color: "red",
                                    fontSize: "2em",
                                    transform: "translate(113px, 283px) rotate(-35deg)", border: "5px solid red", borderRadius: "15px"
                                }}>CONTRE</div>
                            </div>
                            <div ref={card.stamps.osef} className={cx('card-stamp')}>
                                <div style={{
                                    color: "grey",
                                    fontSize: "3em",
                                    transform: "translate(52px, 297px) rotate(-9deg)", border: "5px solid grey", borderRadius: "15px"
                                }}>OSEF</div>
                            </div>
                        </SwipeCard>)}
                    </div>
                </div>
                <div className={cx("container", "buttons")}>
                    <div
                        className={cx("container", "button")}
                        data-value="{'importance': 1, 'pour': -1}"
                        onClick={e => this.swipeTopCard("left")}
                    >
                        Contre
                </div>
                    <div
                        className={cx("container", "button")}
                        data-value="{'importance': 0, 'pour': 0}"
                        onClick={e => this.swipeTopCard("up")}
                    >
                        OSEF
                </div>
                    <div
                        className={cx("container", "button")}
                        data-value="{'importance': 1, 'pour': 1}"
                        onClick={e => this.swipeTopCard("right")}>
                        Pour
                </div>
                </div>
            </div>
        );
    }
};

export default Questions;
