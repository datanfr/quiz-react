import classNames from 'classnames/bind';
import classes from './Resultat.module.css';
import { IonPage } from '@ionic/react';
import React, { PureComponent, useEffect, useState } from 'react';
import Header from '../components/Header';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

let cx = classNames.bind(classes);

const votesPerDeputeById: any = {}

Object.assign(window, {votesPerDeputeById})

export const BuildVotes: React.FC = () => {
    const [fetched, setFetched] = useState([])


    function fetchQuestionsVote(id: number) {
        fetch(`https://datan.fr/api/votes/get_vote_deputes?num=${id}&legislature=15`)
            .then(resp => resp.json())
            .then(json => {
                // [
                //     {
                //         "mpId": "PA605036",
                //         "vote": "1",
                //         "mandatId": "PM731292",
                //         "scoreLoyaute": "1",
                //         "legislature": "15",
                //         "vote_libelle": "pour",
                //         "loyaute_libelle": "loyal",
                //         "nameFirst": "Damien",
                //         "nameLast": "Abad",
                //         "nameUrl": "damien-abad",
                //         "dptSlug": "ain-01",
                //         "libelle": "Les R\u00e9publicains",
                //         "libelleAbrev": "LR"
                //     }
                // }
                for (const {mpId, nameFirst, nameLast, vote_libelle, dptSlug, nameUrl} of json) {
                    const obj = votesPerDeputeById[mpId] || {
                        id: mpId,
                        "name": nameFirst + " " + nameLast,
                        "page-url": `https://datan.fr/deputes/${dptSlug}/depute_${nameUrl}`,
                        vote: {}
                    }
                    obj.vote[`VTANR5L15V${id}`] = vote_libelle
                    votesPerDeputeById[mpId] = obj
                }
            })
    }

    function fetchQuestions() {
        fetch('https://datan.fr/api/quizz/get_questions_api?quizz=1')
            .then(resp => resp.json())
            .then(json => {
                console.log("Size fetecg", json.length)
                for (const vote of json) {
                    console.log("Fetching ", vote.voteNumero)
                    fetchQuestionsVote(vote.voteNumero)
                }
            })
    }

    useEffect(() => {
        fetchQuestions()
    })

    return <IonPage>
        <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
            <div className={cx("center-body")}>
                <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
                    <pre>
                        {fetched.length}
                        {JSON.stringify(fetched, null, " ")}
                    </pre>
                </div>
            </div>
        </div>
        <Header title={`Résultat`} />

    </IonPage>
}