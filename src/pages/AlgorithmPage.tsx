
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
            <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
                <div style={{marginTop: "50px"}}>
                    <h1 className={cx("title")}>Méthodologie du quiz</h1>
                    <p>
                        Ce quiz politique <b>mesure votre proximité idéologique</b> avec votre député.
                    </p>
                    <p>
                        Autrement dit, avez-vous les mêmes positions politiques que le député vous représentant à l'Assemblée nationale ?
                    </p>
                    <h2>1. Un quiz basé sur les votes des députés</h2>
                    <p>
                        Ce quiz est basé sur les positions prises par les parlementaires lorsqu'ils votent à l'Assemblée nationale.
                    </p>
                    <p>
                         Le vote est une activité essentielle pour un député. Les parlementaires votent pour ou contre des projets de loi qui auront un impact direct sur la vie des citoyens. Entre 2017 et 2022, il y a eu plus de 4 000 scrutins à l'Assemblée nationale.
                    </p>
                    <p>
                        Ce quiz mesure la proximité idéologique <b>sur la base des positions prises par les députés lors de ces votes</b>, et non sur la base de positions prises dans les médias ou dans un programme politique.
                    </p>
                    <p>
                        En répondant à ce quiz, vous répondez donc à des questions qui ont fait l'objet d'un vote entre 2017 et 2022 à l'Assemblée nationale.
                    </p>
                    <h2>2. Le choix des votes</h2>
                    <p>
                        Nous avons sélectionné 20 votes qui ont eu lieu à l'Assemblée nationale entre 2017 et 2022.
                    </p>
                    <p>
                        Plusieurs critères sont entrés en jeu pour la sélection de ces votes :
                    </p>
                    <ul>
                        <li>Des votes sur des sujets dits salient : la question traitée dans le vote doit avoir fait l'objet de débats politiques et médiatiques entre 2017 et 2022.</li>
                        <li>Des votes sur des sujets clivant : il doit y avoir eu un nombre important de députés en faveur du vote ainsi qu'un nombre important contre le vote.</li>
                        <li>Des votes avec un fort taux de participation des députés : nous avons privilégié les votes sur lesquels au moins 20% des députés étaient présents pour voter.</li>
                        <li>Des votes sur des sujets compréhensibles : la question traitée dans le vote doit être facilement compréhensible et non technique.</li>
                    </ul>
                    <p>
                        De plus, afin d'avoir un quiz le plus neutre possible, nous nous sommes assurés de la diversité politique des votes (certains votes ont été portés par des groupes de gauche, d'autres par des groupes de droite, d'autres par la majorité présidentielle), ainsi que de la diversité des clivages (certains votes on fait l'objet d'un clivage gauche-droite tandis que d'autres ont fait l'objet d'un clivage majorité-opposition).
                    </p>
                    <h2>Calcul du score de proximité</h2>
                    <h3>Score de proximité avec un député</h3>
                    <p>
                        Le score de proximité avec un <b>député</b> est le pourcentage de questions sur lesquelles vous avez la même position que celle défendue par ce député à l'Assemblée nationale.
                    </p>
                    <p>
                        Autrement dit, si sur les 20 questions vous avez la même position que votre député pour 10 questions, votre taux de proximité sera de 50%.
                    </p>
                    <p>
                        Dans les cas où vous vous abstenez, et que le député a voté "pour" ou "contre", vous avez la moitié des points pour cette question. Ceci vaut également dans les cas où le député s'est abstenu et que vous avez voté "pour" ou "contre".
                    </p>
                    <h3>Score de proximité avec un groupe</h3>
                    <p>
                        Le score de proximité avec un <b>groupe</b> est le pourcentage de questions pour lesquelles vous avez la même position que celle défendue par ce groupe à l'Assemblée nationale.
                    </p>
                    <p>
                        Afin de prendre en compte les divisions internes au sein des groupes politiques, ce score est calculé de la manière suivante : [A FAIRE !]
                    </p>
                    <p>Des questions supplémentaires ? Contactez-nous : <a href="mailto:info@datan.fr">info@datan.fr</a></p>
                </div>
            </div>
        </div>
        <Header />
    </IonPage>
}

const ButtonsSection = () => <div className={cx("buttons", "center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
    <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
        <Link to="/questions" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow", "button")}>
            Recommencer le test
        </Link>
    </div>
</div>
