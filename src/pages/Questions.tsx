import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import classNames from 'classnames/bind';
import classes from './Questions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Component from "../components/SwipeCard"

let cx = classNames.bind(classes);

const Questions: React.FC = () => {
    console.log(classes)
    return (
        <div className={cx("container", "page")}>
            <div className={cx("container", "back-button")}>
                <FontAwesomeIcon icon={faChevronLeft} />
            </div>
            <div className={cx("container", "title")}>Environnement</div>
            <div className={cx("container", "swipe-card-content")}>
                <Component name="Alexis" />
                {/* <SwipeCard cards="cards" onswipe="onswipe">
        <template v-slot:default="swipeProps">
          Hello i'm swipe card content<br/>
          {{swipeProps.card.content}}<br/>
          speed:{{swipeProps.speed}}<br/>
          delta:{{swipeProps.current.deltaX}}<br/>
        </template>
      </swipe-card> */}
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
