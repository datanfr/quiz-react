import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import SwipeCard from "../components/SwipeCard"
import { Fragment } from 'react';

let cx = classNames.bind(classes);

type Card = {
    titre:string
    content:string
    swiped?:string
}

const cards : Card[] = [
    { "titre": "environnement (1/6)", "content": "coucou" },
    { "titre": "environnement (2/6)", "content": "hola" },
    { "titre": "environnement (3/6)", "content": "hello" }
]

function onSwipe(e: React.TouchEvent<HTMLDivElement>, side: String, card : Card) {
    Object.assign(card, {swiped: side})
    if (cards.every(x => x.swiped)) {
        console.log("All card swiped !", cards)
    }
}

const Questions: React.FC = () => {
    console.log(classes)
    return (
        <div className={cx("container", "page")}>
            <div className={cx("container", "back-button")}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </div>
            <div className={cx("container", "title")}>Environnement</div>
            <div className={cx("container", "cards")}>
                <div className={cx("card-stack")}>
                { cards.map(card => <SwipeCard className={cx("card")} key={card.titre} onSwipe={(e, side) => onSwipe(e, side, card)}>
                        {card.titre}<br />
                        Hello i'm swipe card content<br />
                        {card.content}<br />
                </SwipeCard>)}
                </div>
            </div>
            <div className={cx("container", "buttons")}>
                <div className={cx("container", "button")} data-value="{'importance': 1, 'pour': -1}">Contre</div>
                <div className={cx("container", "button")} data-value="{'importance': 0, 'pour': 0}">OSEF</div>
                <div className={cx("container", "button")} data-value="{'importance': 1, 'pour': 1}">Pour</div>
            </div>
        </div>
    );
};

export default Questions;
