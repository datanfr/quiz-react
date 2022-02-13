import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import Header from '../components/Header';

import votesPerDepute from '../data/votes-per-depute.json'
import votesPerGroupe from '../data/votes-per-groupe.json'
import { buildDeputes, buildGroupes, DeputeWithVote, GroupeWithVote } from "../models/Vote"

import classes from './Resultat.module.css';
import { Plugins } from '@capacitor/core';
import { getResponses, Reponse } from '../models/Reponse';
import { calculateDeputeSimilarity, calculateGroupeSimilarity } from '../calculateScore';
const { Storage } = Plugins;


let cx = classNames.bind(classes);

type ResDeputeType = { depute: DeputeWithVote, similarity: number }
type ResGroupeType = { groupe: GroupeWithVote, similarity: number }

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
    //const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    const fetchingVotesPerDepute = buildDeputes().then(x => Object.values(x))
    const fetchingVotesPerGroupe = buildGroupes().then(x => Object.values(x))
    fetchingResponses.then(userVotes => this.setState({ userVotes }))
    Promise.all([fetchingResponses, fetchingVotesPerDepute, fetchingVotesPerGroupe]).then(([responses, votesPerDepute, votesPerGroupe]) => {
      Object.assign(window as any, { votesPerDepute, votesPerGroupe })
      const scoredDeputes = votesPerDepute.map(depute => ({ depute, ...calculateDeputeSimilarity(depute.votes as Record<string, Reponse | null>, responses) }))
      const sortedDeputes = scoredDeputes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      const scoredGroupes = votesPerGroupe.map(groupe => ({ groupe, ...calculateGroupeSimilarity(groupe.votes as Record<string, { pour: number, contre: number, abstention: number }>, responses) }))
      const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      Object.assign(window as any, { sortedDeputes, sortedGroupes })
      this.setState({ sortedDeputes, sortedGroupes })
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
            <h1>Groupe</h1>
            <div className={cx("res-groupe-container")}>
              {this.state.sortedGroupes.map(x => <ResGroupe data={x} />)}
            </div>
            <h1>Depute</h1>
            <div className={cx("res-depute-container")}>
              {this.state.sortedDeputes.map(x => <ResDepute data={x} />)}
            </div>
            <pre>
              //USER VOTES<br />
              {JSON.stringify(this.state.userVotes, null, " ")}<br /><br />
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
            <img src={`https://datan.fr/assets/imgs/deputes_original/depute_${props.data.depute.id}.png`} width="150" height="192" alt={props.data.depute.name} />
          </picture>
        </div>
      </div>
      <div className={cx("data-container")}>
        <div className={cx("title")} style={{ fontSize: (3 / (props.data.depute.name.length ** 0.30)) + "em" }}>{props.data.depute.name}</div>
        <div className={cx("groupe")}>{props.data.depute.groupe_name}</div>
      </div>
      <div className={cx("badge")} onMouseEnter={() => console.log(props.data)}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </a>
}

function ResGroupe(props: { data: ResGroupeType }) {
  return <a href={props.data.groupe['page-url']}>
    <div className={cx("res-groupe")}>
      <div className={cx("picture-container")}>
        <div className={cx("groupe-img-circle")}>
          {props.data.groupe.picture}
        </div>
      </div>
      <div className={cx("data-container")}>
        <div className={cx("title")} style={{ fontSize: (3 / (props.data.groupe.id.length ** 0.30)) + "em" }}>{props.data.groupe.id}</div>
      </div>
      <div className={cx("badge")} onMouseEnter={() => console.log(props.data)}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </a>
}
export default withRouter(Resultat)