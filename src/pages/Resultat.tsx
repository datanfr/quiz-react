import { faChevronDown, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import ReactDOMServer from 'react-dom/server'
import Header from '../components/Header';

import { fetchingGroupes, fetchingVotesPerGroupe, GroupeWithVote } from "../models/Groupe"
import { buildDeputeIndex, DeputeWithScore, DeputeWithVote, fetchingDeputes, fetchingVotesPerDepute } from "../models/Depute"

import classes from './Resultat.module.css';
import { Plugins } from '@capacitor/core';
import { getResponses, Reponse } from '../models/Reponse';
import { fetchQuestions, Questions } from "../models/Question"
import { algorithms as scoringAlgorithms, algorithmsNames, algoFromString } from '../scoring-algorithm/ScoringAlgorithm';
import { buildIndex, search, Index as SearchIndex, SearchResponse } from "../searchAlgo";
import { highlightArray, highlightField } from '../highlightAlgo';
import { groupBy, hexToHSL, hslaToCss, hwbLerp, hslToCss, hwbToCss } from '../utils';
const { Storage } = Plugins;

const words = ['eat', 'sleep', 'drink', 'snore', 'foo', 'buzz', 'whatever'];




let cx = classNames.bind(classes);

type ResDeputeType = { depute: DeputeWithVote, similarity: number }
type ResGroupeType = { groupe: GroupeWithVote, similarity: number }

interface Props extends RouteComponentProps { }
interface State {
  userVotes: Record<string, Reponse>,
  deputeScoreById: Record<string, ResDeputeType>;
  deputeIndex: SearchIndex | null,
  filteredDeputes: SearchResponse[] | null,
  sortedGroupes: ResGroupeType[],
  chunk: number,
  searchTxt: string,
  avgScore: number | null,
  avgScoreGroupe: number | null
}

class Resultat extends PureComponent<Props, State> {

  params: URLSearchParams;
  timeoutHandle: NodeJS.Timeout | null;
  myRef: React.RefObject<HTMLDivElement>

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
    this.timeoutHandle = null;
    this.state = {
      deputeScoreById: {},
      deputeIndex: null,
      sortedGroupes: [],
      filteredDeputes: [],
      userVotes: {},
      chunk: 1,
      searchTxt: "",
      avgScore: null,
      avgScoreGroupe: null
    }
    this.myRef = React.createRef()
  }

  componentDidMount() {
    const fetchingResponses = getResponses()
    // const algorythmName = algoFromString(this.params.get("algorithm"), () => "confianceXCompatibilite")
    // console.log({ algorythmName })
    //const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    fetchingResponses.then(userVotes => this.setState({ userVotes }))
    Promise.all([fetchingResponses, fetchingDeputes, fetchingGroupes, buildDeputeIndex, fetchQuestions]).then(([responses, deputes, groupes, deputeIndex, questions]) => {
      Object.assign(window as any, { deputes, groupes })
      const scoredDeputes = deputes.map(depute => ({ depute, ...scoringAlgorithms["confianceXCompatibilite"].depute(depute.votes as Record<string, Reponse | null>, responses, questions) }))
      const avgScore = scoredDeputes.map(x => x.similarity).reduce((a, b) => a + b) / scoredDeputes.length
      console.log({ avgScore })
      const deputeScoreById = groupBy(scoredDeputes, x => x.depute.id)
      const scoredGroupes = groupes.map(groupe => ({ groupe, ...scoringAlgorithms["confianceXCompatibilite"].groupe(groupe, responses, questions) })).filter(x => /*x.calcData.tauxConfiance > 0.5 && */x.groupe.name != "Non inscrit")
      const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      const avgScoreGroupe = scoredGroupes.map(x => x.similarity).reduce((a, b) => a + b) / scoredGroupes.length
      const calculated = { deputeIndex, deputeScoreById, sortedGroupes, filteredDeputes: null, avgScore, avgScoreGroupe }
      Object.assign(window as any, { calculated })
      this.setState(calculated)
    })

    // const fetchingVotesPerGroupe = Promise.resolve(votesPerGroupe)
    // Promise.all([fetchingResponses, fetchingVotesPerGroupe]).then(([responses, votesPerGroupe]) => {
    //   const scoredGroupes = votesPerGroupe.map(groupe => ({ groupe, similarity: calculateVoteSimilarity(groupe.votes as Record<string, Reponse>, responses) }))
    //   const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
    //   this.setState({ sortedGroupes })
    // })

  }


  loadMore(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    const everythingLoaded = this.state.filteredDeputes ? 20 * this.state.chunk > this.state.filteredDeputes.length : true
    if (!everythingLoaded && window.innerHeight + e.currentTarget.scrollTop >= (e.currentTarget.scrollHeight - window.innerHeight)) {
      this.setState({ chunk: this.state.chunk + 1 })
    }
  }

  onSearchTxtChange(e: React.FormEvent<HTMLInputElement>) {
    const searchTxt = e.currentTarget.value;
    console.log("reseting timeout")
    const searchDelay = window.localStorage.getItem("searchDelay")
    if (this.timeoutHandle != null) clearTimeout(this.timeoutHandle)
    this.timeoutHandle = setTimeout(() => {
      console.log(`update text: ${searchTxt}`)
      this.setState({ searchTxt });
      if (this.state.deputeIndex) {
        const filteredDeputes = searchTxt ? search(this.state.deputeIndex, searchTxt) : null
        Object.assign(window as any, { filteredDeputes })
        this.setState({ filteredDeputes })
      }
      this.myRef.current?.scrollTo(0, 0);
    }, searchDelay ? JSON.parse(searchDelay) : 180)
  }

  render() {
    let DeputeResList;
    let everythingLoaded = false
    if (this.state.filteredDeputes) {
      const currentChunk = this.state.filteredDeputes.slice(0, 20 * this.state.chunk)
      everythingLoaded = 20 * this.state.chunk > this.state.filteredDeputes.length
      DeputeResList = () => <div style={{
        display: "flex", flexDirection: "row", flexWrap: "wrap",
        justifyContent: "center", marginTop: "20px"
      }}>
        {currentChunk.map(x => <ResDeputeFiltered data={x} resDepute={this.state.deputeScoreById[x.item.id]} avgScore={this.state.avgScore} />)}
      </div>
    } else {
      DeputeResList = () => <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "20px", alignItems: "center"
      }}>
        <div><FontAwesomeIcon icon={faChevronUp} /></div>
        <div className={cx("pattern_background")} style={{ border: "1px solid var(--datan-green)", borderRadius: "10px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: "0 0 100%", padding: "0 20px", margin: "20px 20px" }}>
          <p style={{ fontWeight: 800, fontSize: "1.4rem", textAlign: "center", marginTop: "32px", color: "var(--datan-grey)" }}>🎉 Félicitations 🎉</p>
          <p style={{ textAlign: "center" }}>Tu viens de répondre à toutes les questions !</p>
          <p style={{ textAlign: "center" }}><span style={{ color: "var(--datan-green)", fontWeight: 800 }}>Cherche ton député dans la barre ci-dessus</span> et découvre s'il partage tes positions politiques.</p>
          <p style={{ textAlign: "center" }}>Tu peux aussi te comparer avec les groupes politiques de l'Assemblée nationale. <span style={{ color: "var(--datan-green)", fontWeight: 800 }}>Découvre le classement ci-dessous !</span></p>
          <p style={{ textAlign: "center", marginBottom: "32px" }}>
              Tu veux en savoir plus sur notre méthodologie ? <Link to={{ pathname: `methodologie` }} style={{ textDecoration: "underline" }}>Clique ici !</Link >
          </p>
        </div>

        <div><FontAwesomeIcon icon={faChevronDown} /></div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
          <div style={{ textAlign: "center", fontWeight: 800, color: "var(--datan-grey)", fontSize: "1.3rem" }}>Ta proximité avec les groupes politiques</div>
          <div className={cx("res-groupe-container")}>
            {this.state.sortedGroupes.map(x => <ResGroupe data={x} avgScoreGroupe={this.state.avgScoreGroupe} />)}
            <div style={{ height: "var(--buttons-height)", width: "100%" }}></div>
          </div>
        </div>

      </div>
    }
    return <IonPage>
      <div id="inifinte-scroll" style={{ overflow: "auto", justifyContent: "flex-start" }} onScroll={this.state.filteredDeputes ? e => this.loadMore(e) : undefined} ref={this.myRef}>
        <div className={cx("search-container")} style={{ padding: "20px 0" }}>
          <div style={{ margin: "0 35px", marginBottom: "10px", color: "#ffffff", fontWeight: 800, fontSize: "1.4rem", textAlign: "center" }}>Recherche ton député</div>
          <div style={{ display: "flex" }}>
            <input
              name={cx("search")}
              className={cx("search-input")} type="text"
              placeholder="Cherchez un député, une ville, un département, un code postal"
              defaultValue={this.state.searchTxt} onInput={e => this.onSearchTxtChange(e)}
              style={{ fontFamily: "Arial, FontAwesome" }}
            />
          </div>


        </div>
        <div className={cx("center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
          <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            {this.state.sortedGroupes.length > 0 || <div className="flex align-justify-center" style={{height: "calc(100vh - 125px - var(--header-height))"}}>
              Calcule des score en cours...
            </div>}
            {Object.values(this.state.deputeScoreById).length > 0 && <div className={cx("res-depute-container")}>
              <DeputeResList />
              {everythingLoaded && <div style={{ height: "var(--buttons-height)", width: "100%" }}></div>}
            </div>}
          </div>
        </div>
      </div>
      <Header />
      <div className={cx("buttons", "center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
        <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
          <Link to="/questions" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow", "button")}>
            Recommencer le test
          </Link>
        </div>
      </div>
    </IonPage >
  }
}

const badgeColorGradient = { //colorGradient
  start: {//similar
    h: 169,
    w: 1,
    b: 0.28
  },
  end: {//different
    h: 169,
    w: 0,
    b: 0.28
  }
}

function ResDepute(props: { data: ResDeputeType }) {
  const badgeBgColor = hwbLerp(props.data.similarity, badgeColorGradient)
  const groupColor = props.data.depute.last.couleurAssociee as string

  return <Link key={props.data.depute.id} to={`depute-stats/${props.data.depute.id}`} >
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
        <div className={cx("title")} style={{ fontSize: (2.9 / (props.data.depute.name.length ** 0.30)) + "em" }}>{props.data.depute.name}</div>
        <div className={cx("groupe")} style={{ color: groupColor, fontSize: "0.8em" }}>{props.data.depute.last.libelle}</div>
      </div>
      <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} onMouseEnter={() => console.log(props.data)}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </Link>
}

function ResDeputeFiltered(props: { data: SearchResponse, resDepute: ResDeputeType, avgScore: number | null }) {
  const badgeBgColor = hwbLerp(props.resDepute?.similarity, badgeColorGradient)
  const { h, s, l } = props.data.item.last.couleurAssociee ? hexToHSL(props.data.item.last.couleurAssociee as string) : { h: 0, s: 0, l: 0 } //Couleur député non inscrit
  const hglnom = highlightField(props.data.metadata, "name", { color: hslToCss({ h, s, l: l * 0.80 }), fontWeight: 900 }) || props.data.item.name
  let hglcommunes = highlightArray(props.data.metadata, "depute.cities.indexedName", { color: hslToCss({ h, s, l: l > 0.4 ? l - 0.20 : l + 0.20 }), fontWeight: 800 }) || []
  if (hglcommunes.length > 20) {
    hglcommunes = [...hglcommunes.slice(0, 19), `et ${hglcommunes.length - 19} autres...`]
  }
  const CommuneListHtml = () => hglcommunes.length ? <div className="commune-list">{hglcommunes.map((x) => <div className="elem">{x}</div>)}</div> : null

  // let hglCp = highlightArray(props.data.metadata, "depute.cities.codePostal", {color:  `hsl(${h},${s - 40}%, ${v}%)`}) || []
  // if (hglCp.length > 20) {
  //   hglCp = [...hglCp.slice(0, 19), `et ${hglCp.length - 19} autres...`]
  // }
  // const CpListHtml = () => hglCp.length ? <div className="commune-list">{hglCp.map((x) => <div className="elem">{x}</div>)}</div> : null

  return <Link key={props.data.item.id} to={{ pathname: `depute-stats/${props.data.item.id}`, state: { avgScore: props.avgScore } }}  >
    <div className={cx("res-depute")}>
      <div className={cx("picture-container")}>
        <div className={cx("depute-img-circle")}>
          <picture>
            <source srcSet={`https://datan.fr/assets/imgs/deputes_nobg_webp/depute_${props.data.item.id}_webp.webp`} type="image/webp" />
            <source srcSet={`"https://datan.fr/assets/imgs/deputes_nobg/depute_${props.data.item.id}.png`} type="image/png" />
            <img src={`https://datan.fr/assets/imgs/deputes_original/depute_${props.data.item.id}.png`} width="150" height="192" alt={props.data.item.name} />
          </picture>
        </div>
      </div>
      <div className={cx("data-container")}>
        <div className={cx("title")} style={{ fontSize: (2.9 / (props.data.item.name.length ** 0.30)) + "em" }}>{hglnom}</div>
        <div className={cx("groupe")} style={{ color: hslaToCss({ h, s, l }, 1), fontSize: "0.8em" }} data-color={hslToCss({ h, s, l })} data-color-high={hslToCss({ h, s, l: l > 0.3 ? l - 0.30 : l + 0.30 })}>{props.data.item.last.libelle}</div>
        <div className={cx("groupe")} style={{ color: hslaToCss({ h, s, l }, 0.75), fontSize: "0.8em" }}><CommuneListHtml /></div>
      </div>
      <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} onMouseEnter={() => console.log(props.data)}>{Math.round(props.resDepute?.similarity * 100)}%</div>
    </div >
  </Link>
}



function ResGroupe(props: { data: ResGroupeType, avgScoreGroupe: number | null }) {

  const badgeBgColor = hwbLerp(props.data.similarity, badgeColorGradient)

  return <Link className={cx("res-groupe")} key={props.data.groupe.id} to={{
    pathname: `groupe-stats/${props.data.groupe.id}`,
    state: { avgScoreGroupe: props.avgScoreGroupe }
  }} >
    <div className={cx("picture-container")}>
      <div className={cx("groupe-img-circle")}>
        {props.data.groupe.picture}
      </div>
    </div>
    <div className={cx("data-container")}>
      <div className={cx("title")} style={{ fontSize: (3 / (props.data.groupe.name.length ** 0.30)) + "em" }}>
        {props.data.groupe.name}
      </div>
    </div>
    <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} onMouseEnter={() => console.log(props.data)}>
      {Math.round(props.data.similarity * 100)}%
    </div>
  </Link >

}
export default withRouter(Resultat)
