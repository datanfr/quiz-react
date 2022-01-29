import classNames from 'classnames/bind';
import classes from './Resultat.module.css';
import { IonPage } from '@ionic/react';
import React, { PureComponent, useEffect, useState } from 'react';
import Header from '../components/Header';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

let cx = classNames.bind(classes);



export const BuildVotes: React.FC = () => {
    const [fetched, setFetched] = useState([])




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