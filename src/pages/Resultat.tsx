import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { IonPage } from '@ionic/react';

import classNames from 'classnames/bind';
import React, { PureComponent } from 'react';
import ReactDOMServer from 'react-dom/server'
import Header from '../components/Header';

import votesPerDepute from '../data/votes-per-depute.json'
import votesPerGroupe from '../data/votes-per-groupe.json'
import { fetchingVotesPerGroupe, GroupeWithVote } from "../models/Groupe"
import { buildDeputeIndex, DeputeWithScore, DeputeWithVote, fetchingVotesPerDepute } from "../models/Depute"

import classes from './Resultat.module.css';
import { Plugins } from '@capacitor/core';
import { getResponses, Reponse } from '../models/Reponse';
import { calculateDeputeSimilarity, calculateGroupeSimilarity } from '../calculateScore';
import { buildIndex, search, Index as SearchIndex, SearchResponse } from "../searchAlgo";
import { highlightArray, highlightField } from '../highlightAlgo';
import { groupBy, hexToHSL, hslaToCss, hslToCss } from '../utils';
const { Storage } = Plugins;


let cx = classNames.bind(classes);

type ResDeputeType = { depute: DeputeWithVote, similarity: number }
type ResGroupeType = { groupe: GroupeWithVote, similarity: number }

interface Props extends RouteComponentProps { }
interface State {
  userVotes: Record<string, Reponse>,
  sortedDeputes: ResDeputeType[],
  deputeScoreById: Record<string, ResDeputeType>;
  deputeIndex: SearchIndex | null,
  filteredDeputes: SearchResponse[] | null,
  sortedGroupes: ResGroupeType[],
  displayGroupe: boolean,
  chunk: number,
  searchTxt: string
}

class Resultat extends PureComponent<Props, State> {

  params: URLSearchParams;
  timeoutHandle: NodeJS.Timeout | null;
  myRef : React.RefObject<HTMLDivElement>

  constructor(props: Props) {
    super(props);
    this.params = new URLSearchParams(window.location.search)
    this.timeoutHandle = null;
    this.state = {
      sortedDeputes: [],
      deputeScoreById: {},
      deputeIndex: null,
      sortedGroupes: [],
      filteredDeputes: [],
      userVotes: {},
      displayGroupe: false,
      chunk: 1,
      searchTxt: ""
    }
    this.myRef = React.createRef()
  }

  componentDidMount() {
    const fetchingResponses = getResponses()
    //const fetchingVotesPerDepute = Promise.resolve(votesPerDepute)
    fetchingResponses.then(userVotes => this.setState({ userVotes }))
    Promise.all([fetchingResponses, fetchingVotesPerDepute, fetchingVotesPerGroupe, buildDeputeIndex]).then(([responses, votesPerDepute, votesPerGroupe, deputeIndex]) => {
      Object.assign(window as any, { votesPerDepute, votesPerGroupe })
      const scoredDeputes = votesPerDepute.map(depute => ({ depute, ...calculateDeputeSimilarity(depute.votes as Record<string, Reponse | null>, responses) }))
      const sortedDeputes = scoredDeputes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      const deputeScoreById = groupBy(sortedDeputes, x => x.depute.id)
      const scoredGroupes = votesPerGroupe.map(groupe => ({ groupe, ...calculateGroupeSimilarity(groupe.votes as Record<string, { pour: number, contre: number, abstention: number }>, responses) }))
      const sortedGroupes = scoredGroupes.sort((a, b) => (a.similarity < b.similarity) ? 1 : (a.similarity > b.similarity) ? -1 : 0)
      const calculated = { sortedDeputes, deputeIndex, deputeScoreById, sortedGroupes, filteredDeputes: null }
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
    if (!this.state.displayGroupe && window.innerHeight + e.currentTarget.scrollTop >= (e.currentTarget.scrollHeight - window.innerHeight)) {
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
        Object.assign(window as any, {filteredDeputes})
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
      DeputeResList = () => <>
      {currentChunk.map(x => <ResDeputeFiltered data={x} resDepute={this.state.deputeScoreById[x.item.id]} />)}
      </>
    } else {  
      const currentChunk = this.state.sortedDeputes.slice(0, 20 * this.state.chunk)
      everythingLoaded = 20 * this.state.chunk > this.state.sortedDeputes.length
      DeputeResList = () => <>
        {currentChunk.map(x => <ResDepute data={x} />)}
      </>
    }
    return <IonPage>
      <div id="inifinte-scroll" style={{ overflow: "auto", justifyContent: "flex-start" }} onScroll={e => this.loadMore(e)} ref={this.myRef}>
        <div className={cx("center-body")}>
          <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            {this.state.sortedGroupes.length > 0 || "Calcule des score..."}
            <div className={cx("res-groupe-container")} style={{ display: this.state.displayGroupe ? "flex" : "none" }}>
              {this.state.sortedGroupes.map(x => <ResGroupe data={x} />)}
              <div style={{ height: "var(--buttons-height)", width: "100%" }}></div>
            </div>
            {this.state.sortedDeputes.length > 0 && <div className={cx("res-depute-container")} style={{ display: !this.state.displayGroupe ? "flex" : "none" }}>
              <input
                className={cx("search-input")} type="text"
                placeholder="Rechercher un député par nom, ville, département, etc.."
                defaultValue={this.state.searchTxt} onInput={e => this.onSearchTxtChange(e)}
              />
              <DeputeResList />
              {everythingLoaded && <div style={{ height: "var(--buttons-height)", width: "100%" }}></div>}
            </div>}
          </div>
        </div>
      </div>
      <Header title={`Résultat`} />
      <div className={cx("buttons", "center-body")} >
        <div className={cx("body", "flex")} style={{ justifyContent: "space-evenly", alignContent: "center" }}>
          <Link to="/" className={cx("datan-green-bg", "flex", "align-justify-center", "shadow", "button")} style={{ height: "60px" }}>
            Recommencer le test
          </Link>
          <div className={cx("datan-blue-bg", "flex", "align-justify-center", "shadow", "button")} style={{ height: "60px" }} onClick={() => {
            this.myRef.current?.scrollTo(0, 0);
            return this.setState({ displayGroupe: !this.state.displayGroupe })
          }}>
            {this.state.displayGroupe ? "Afficher les députés" : "Afficher les groupes"}
          </div>
        </div>
      </div>

    </IonPage>
  }
}

function ResDepute(props: { data: ResDeputeType}) {
  const groupColor = props.data.depute.last.couleurAssociee as string
  return <a key={props.data.depute.id} href={props.data.depute['page-url']} target="_blank">
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
      <div className={cx("badge")} onMouseEnter={() => console.log(props.data)}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </a>
}

function ResDeputeFiltered(props: { data: SearchResponse, resDepute: ResDeputeType }) {

  const {h,s,l} = props.data.item.last.couleurAssociee ? hexToHSL(props.data.item.last.couleurAssociee as string) : {h: 0, s:0, l:0} //Couleur député non inscrit
  const hglnom = highlightField(props.data.metadata, "name", {color:  hslToCss({h,s,l: l*0.80}), fontWeight: 900}) || props.data.item.name
  let hglcommunes = highlightArray(props.data.metadata, "depute.cities.indexedName", {color:  hslToCss({h,s,l: l > 0.4 ? l-0.20 : l+0.20}), fontWeight: 800}) || []
  if (hglcommunes.length > 20) {
    hglcommunes = [...hglcommunes.slice(0, 19), `et ${hglcommunes.length - 19} autres...`]
  }
  const CommuneListHtml = () => hglcommunes.length ? <div className="commune-list">{hglcommunes.map((x) => <div className="elem">{x}</div>)}</div> : null

  // let hglCp = highlightArray(props.data.metadata, "depute.cities.codePostal", {color:  `hsl(${h},${s - 40}%, ${v}%)`}) || []
  // if (hglCp.length > 20) {
  //   hglCp = [...hglCp.slice(0, 19), `et ${hglCp.length - 19} autres...`]
  // }
  // const CpListHtml = () => hglCp.length ? <div className="commune-list">{hglCp.map((x) => <div className="elem">{x}</div>)}</div> : null

  return <a key={props.data.item.id} href={props.data.item['page-url']} target="_blank">
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
        <div className={cx("groupe")} style={{ color: hslaToCss({h,s,l}, 1), fontSize: "0.8em" }} data-color={hslToCss({h,s,l})}  data-color-high={hslToCss({h,s,l: l > 0.3 ? l-0.30 : l+0.30})}>{props.data.item.last.libelle}</div>
        <div className={cx("groupe")} style={{ color: hslaToCss({h,s,l}, 0.75), fontSize: "0.8em" }}><CommuneListHtml /></div>
      </div>
      <div className={cx("badge")} onMouseEnter={() => console.log(props.data)}>{Math.round(props.resDepute?.similarity * 100)}%</div>
    </div >
  </a>
}

function ResGroupe(props: { data: ResGroupeType }) {

  return <a href={props.data.groupe['page-url']} target="_blank">
    <div className={cx("res-groupe")}>
      <div className={cx("picture-container")}>
        <div className={cx("groupe-img-circle")}>
          {props.data.groupe.picture}
        </div>
      </div>
      <div className={cx("data-container")}>
        <div className={cx("title")} style={{ fontSize: (3 / (props.data.groupe.name.length ** 0.30)) + "em" }}>{props.data.groupe.name}</div>
      </div>
      <div className={cx("badge")} onMouseEnter={() => console.log(props.data)}>{Math.round(props.data.similarity * 100)}%</div>
    </div >
  </a>
}
export default withRouter(Resultat)