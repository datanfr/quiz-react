
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
//App.css imported in App.tsx is globally available 🤢
import classes from './AlgorithmPage.module.css'; //Page specific css

let cx = classNames.bind(classes);

type AlgorithmPageProps = {
}

export const AlgorithmPage: React.FC<AlgorithmPageProps> = ({}) => {
    return <IonPage>
        <div className={cx("center-body")}>
            <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>Explication ICI</div>
        </div>
        <Header title={`Explication de l'algorithme`} />
    </IonPage>
}

const ButtonsSection = () => <div className={cx("buttons", "center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
    <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
        <Link to="/questions" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow", "button")}>
            Recommencer le test
        </Link>
    </div>
</div>
