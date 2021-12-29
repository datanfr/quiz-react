import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';

import votesPerDepute from '../data/votes-per-depute.json'
import votesPerGroupe from '../data/votes-per-groupe.json'

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;


let cx = classNames;

interface Props extends RouteComponentProps { }
interface State { }

class Resultat extends PureComponent<Props, State> {

  params: URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
  }

  componentDidMount() {
    const fetchingResponses = Storage.get({key: "responses"}).then(x => x.value ? JSON.parse(x.value) : {})
    const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    Promise.all([fetchingResponses, fetchingVotesPerDepute]).then(([responses, votesPerDepute]) => {
      const scoredDepute = votesPerDepute.map(depute => ({depute, score: calculateScore(depute, responses)}))
      const sortedDepute = sort(scoredDepute)
      this.setState({resultatDepute: sortedDepute})
    })
  
    Promise.all([fetchingResponses, fetchingVotesPerDepute]).then(([responses, votesPerGroupe]) => {
      const scoredDepute = votesPerDepute.map(depute => ({depute, score: calculateScore(depute, responses)}))
      const sortedDepute = sort(scoredDepute)
      this.setState({resultatDepute: sortedDepute})
    })
  }

  render() {

    return <IonPage>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")} style={{marginTop: "var(--header-height)"}}>
            content
            adsf
            adsf
            adsf
            asdf
          </div>
        </div>
      </div>
      <Header title={`Résultat`} />
      <div className={cx("buttons", "center-body")} >
        <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
          <Link to="/" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow")} style={{ height: "60px" }}>
            Recommencer le test
          </Link>
        </div>
      </div>

    </IonPage>
  }
}

export default withRouter(Resultat)