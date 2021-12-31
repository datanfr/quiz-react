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
import { getResponses, Reponse } from '../models/Reponse';
import { calculateVoteSimilarity } from '../calculateScore';
const { Storage } = Plugins;


let cx = classNames;

interface Props extends RouteComponentProps { }
interface State {
  userVotes : Record<string, Reponse>
  sortedDeputes : {depute: typeof votesPerDepute[0], similarity: number}[]
  sortedGroupes : {groupe: typeof votesPerGroupe[0], similarity: number}[]
}

class Resultat extends PureComponent<Props, State> {

  params: URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
    this.state = {sortedDeputes: [], sortedGroupes: [], userVotes: {}}
  }

  componentDidMount() {
    const fetchingResponses = getResponses()
    const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    fetchingResponses.then(userVotes => this.setState({userVotes}))
    Promise.all([fetchingResponses, fetchingVotesPerDepute]).then(([responses, votesPerDepute]) => {
      const scoredDeputes = votesPerDepute.map(depute => ({depute, similarity: calculateVoteSimilarity(depute.votes as Record<string, Reponse>, responses)}))
      const sortedDeputes = scoredDeputes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0) 
      this.setState({sortedDeputes})
    })
  
    const fetchingVotesPerGroupe = Promise.resolve(votesPerGroupe)
    Promise.all([fetchingResponses, fetchingVotesPerGroupe]).then(([responses, votesPerGroupe]) => {
      const scoredGroupes = votesPerGroupe.map(groupe => ({groupe, similarity: calculateVoteSimilarity(groupe.votes as Record<string, Reponse>, responses)}))
      const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0) 
      this.setState({sortedGroupes})
    })
  }

  render() {

    return <IonPage>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")} style={{marginTop: "var(--header-height)"}}>
            <pre>
              //USER VOTES<br/>
              {JSON.stringify(this.state.userVotes, null, " ")}<br/><br/>
              //DEPUTES LIST<br/>
              {JSON.stringify(this.state.sortedDeputes, null, " ")}<br/><br/>
              //GROUPES LIST<br/>
              {JSON.stringify(this.state.sortedGroupes, null, " ")}<br/><br/>
            </pre>
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