import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';

import votesPerDepute from '../data/votes-per-depute.json'
import votesPerGroupe from '../data/votes-per-groupe.json'

import classes from './Resultat.module.css';
import { Plugins } from '@capacitor/core';
import { getResponses, Reponse } from '../models/Reponse';
import { calculateVoteSimilarity } from '../calculateScore';
const { Storage } = Plugins;


let cx = classNames.bind(classes);

type ResDeputeType = { depute: typeof votesPerDepute[0], similarity: number }
type ResGroupeType = { groupe: typeof votesPerGroupe[0], similarity: number }

interface Props extends RouteComponentProps { }
interface State {
  userVotes: Record<string, Reponse>
  sortedDeputes: ResDeputeType[]
  sortedGroupes: ResGroupeType[]
}

class Resultat extends PureComponent<Props, State> {

  params: URLSearchParams;

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
    this.state = { sortedDeputes: [], sortedGroupes: [], userVotes: {} }
  }

  componentDidMount() {
    const fetchingResponses = getResponses()
    const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    fetchingResponses.then(userVotes => this.setState({ userVotes }))
    Promise.all([fetchingResponses, fetchingVotesPerDepute]).then(([responses, votesPerDepute]) => {
      const scoredDeputes = votesPerDepute.map(depute => ({ depute, similarity: calculateVoteSimilarity(depute.votes as Record<string, Reponse>, responses) }))
      const sortedDeputes = scoredDeputes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      this.setState({ sortedDeputes })
    })

    // const fetchingVotesPerGroupe = Promise.resolve(votesPerGroupe)
    // Promise.all([fetchingResponses, fetchingVotesPerGroupe]).then(([responses, votesPerGroupe]) => {
    //   const scoredGroupes = votesPerGroupe.map(groupe => ({ groupe, similarity: calculateVoteSimilarity(groupe.votes as Record<string, Reponse>, responses) }))
    //   const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
    //   this.setState({ sortedGroupes })
    // })
  }

  render() {
    return <IonPage>
      <div style={{ overflow: "auto", justifyContent: "flex-start" }}>
        <div className={cx("center-body")}>
          <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            <div className={cx("res-depute-container")}>
              {this.state.sortedDeputes.map(x => <ResDepute data={x} />)}
            </div>
            <pre>
              //USER VOTES<br />
              {JSON.stringify(this.state.userVotes, null, " ")}<br /><br />
              //DEPUTES LIST<br />
              //GROUPES LIST<br />
              {JSON.stringify(this.state.sortedGroupes, null, " ")}<br /><br />
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

function ResDepute(props: { data: ResDeputeType }) {
  return <a href={props.data.depute['page-url']}>
    <div className={cx("res-depute")}>
      <div className={cx("picture-container")}>
        <div className={cx("depute-img-circle")}>
          <picture>
            <source srcSet={`https://datan.fr/assets/imgs/deputes_nobg_webp/depute_${props.data.depute.id}_webp.webp`} type="image/webp" />
            <source srcSet={`"https://datan.fr/assets/imgs/deputes_nobg/depute_${props.data.depute.id}.png`} type="image/png" />
            <img src={`https://datan.fr/assets/imgs/deputes_original/depute_${props.data.depute.id}.png`} width="150" height="192" alt="Damien Abad" />
          </picture>
        </div>
      </div>
      <div className={cx("data-container")}>
        <div className={cx("title")} style={{fontSize: (3/(props.data.depute.name.length**0.30)) + "em"}}>{props.data.depute.name}</div>
        <div className={cx("groupe")}>{props.data.depute.groupe_name}</div>
      </div>
      <div className={cx("badge")}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </a>
}

export default withRouter(Resultat)