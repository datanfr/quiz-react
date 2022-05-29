import { IonPage } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useHistory, useLocation, useParams } from "react-router"
import Header from "../components/Header"
import { DeputeWithScore, DeputeWithVote, fetchingVotesPerDepute } from "../models/Depute"
import { fetchQuestions, Questions } from "../models/Question"
import { getResponses, Reponse } from "../models/Reponse"
import classNames from 'classnames/bind';
import classes from './DeputeStats.module.css';
import './Circle.css';
import { counter } from "@fortawesome/fontawesome-svg-core"
import { groupBy, hwb, hwbToCss } from "../utils"
import { algorithms as scoringAlgorithms, algorithmsNames, algoFromString } from '../scoring-algorithm/ScoringAlgorithm';
import { compareToDepute } from "../scoring-algorithm/confiance-x-compatibilite"
import { DeputeSocials } from "../components/DeputeSocial"

let cx = classNames.bind(classes);

const absent = <div
    style={{
        backgroundColor: hwbToCss(
            Object.assign({}, hwb.green, { w: 0.5, b: 0.5 })
        )
    }}
    className={cx("flex", "align-justify-center", "shadow", "button")}
>
    ABSENT
</div>

const nspp = <div
    className={cx("flex", "align-justify-center", "shadow", "button", "osef")}

>
    <span style={{ fontWeight: 800 }}>SANS&nbsp;AVIS</span>
</div>

const contre = <div
    className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
>
    <span style={{ fontWeight: 800 }}>CONTRE</span>
</div>

const pour = < div
    className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
>
    <span style={{ fontWeight: 800 }}>POUR</span>
</div >

function trust(s: number, depute: DeputeWithVote) {
    if (s <= 10) {
        return <div><b>Attention</b>, ce score est basé que sur {s} votes car {depute.name} n'était pas tout le temps présent{depute.last.civ == 'Mme' ? 'e' : ''} pour voter. <span style={{ color: "var(--datan-red)", fontWeight: 800 }}>Ce score est donc à prendre avec précaution</span>.</div>
    } else {
        return <div>Ce score est basé sur {s} questions. Nous considérons que c'est suffisant pour le calcul du score de proximité.</div>
    }
}

function comparison(score: number, average: number, depute: string) {
  if (score == average) {
    return <div>Comparé aux autres parlementaires, tes positions politiques <span style={{fontWeight: 800, color: "var(--datan-green)"}}>sont relativement proches</span> de celles de {depute}. En effet, ton taux de proximité moyen avec tous des députés est de {average} %.</div>
  } else if (score < average) {
    return <div>Comparé aux autres parlementaires, tes positions politiques <span style={{fontWeight: 800, color: "var(--datan-red)"}}>ne sont pas proches</span> de celles de {depute}. En effet, ton taux de proximité moyen avec tous des députés est de {average} %.</div>
  } else {
    return <div>Comparé aux autres parlementaires, tes positions politiques <span style={{fontWeight: 800, color: "var(--datan-green)"}}>sont proches</span> de celles de {depute}. En effet, ton taux de proximité moyen avec tous des députés est de {average} %.</div>
  }
}

function getButtons(s: string) {
    switch (s) {
        case "pour": return pour
        case "contre": return contre
        case "abstention": return nspp
        default: return absent
    }
}

type DeputeStatsData = {
    userResponses: Record<string, Reponse>;
    deputeResponses: DeputeWithVote;
    questions: Questions;
}

export const DeputeStatsPage: React.FC = () => {
    const fetchingResponses = getResponses()
    const history = useHistory();
    const location = useLocation<{ avgScore: number | null }>()
    const avgScore = location.state.avgScore
    const [deputeStats, setDeputeStats] = useState<DeputeStatsData | null>(null)
    const { mpId } = useParams<{ mpId: string }>();
    useEffect(() => {
        Promise.all([fetchingResponses, fetchingVotesPerDepute, fetchQuestions]).then(([userResponses, votesPerDepute, questions]) => {
            const deputeResponses = votesPerDepute["PA" + mpId]
            setDeputeStats({
                userResponses,
                deputeResponses,
                questions
            })
        })
    }, [])

    return <IonPage>
        {deputeStats ? <DeputeStats deputeStats={deputeStats} avgScore={avgScore} /> : "Loading data"}
        <Header onBackClick={() => history.goBack()} title={`Résultat`} />
    </IonPage>
}

export const DeputeStats: React.FC<{ deputeStats: DeputeStatsData, avgScore: number | null }> = ({ deputeStats: { deputeResponses, userResponses, questions }, avgScore }) => {
    const algorithmName = algoFromString(new URLSearchParams(window.location.search).get("algorithm"), () => "confianceXCompatibilite")
    console.log({ algorithmName })
    const scoringAlgorithm = scoringAlgorithms[algorithmName]
    const scoring = scoringAlgorithm.depute(deputeResponses.votes as Record<string, Reponse | null>, userResponses, questions)
    const HumanReadable = scoring.HumanReadable
    // const badgeBgColor = hwbLerp(props.data.similarity)
    const voteCount = Object.values(deputeResponses.votes).length
    const groupColor = deputeResponses.last.couleurAssociee as string
    return <div style={{ overflow: "auto" }}><div className={cx("center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "160px", justifyContent: "space-evenly" }}>
                <div className={cx("profile-container")}>
                    <div className={cx("profile")}>
                        <div className={cx("picture-container")}>
                            <div className={cx("depute-img-circle")}>
                                <picture>
                                    <source srcSet={`https://datan.fr/assets/imgs/deputes_nobg_webp/depute_${deputeResponses.id}_webp.webp`} type="image/webp" />
                                    <source srcSet={`"https://datan.fr/assets/imgs/deputes_nobg/depute_${deputeResponses.id}.png`} type="image/png" />
                                    <img src={`https://datan.fr/assets/imgs/deputes_original/depute_${deputeResponses.id}.png`} width="150" height="192" alt={deputeResponses.name} />
                                </picture>
                            </div>
                        </div>
                        <div className={cx("data-container")}>
                            <div className={cx("title")} style={{ fontSize: (4.5 / (deputeResponses.name.length ** 0.30)) + "em" }}>{deputeResponses.name}</div>
                            <div className={cx("groupe")} style={{ color: groupColor }}>{deputeResponses.last.libelle}</div>
                            <div className={cx("district")}>{deputeResponses.last.departementNom} ({deputeResponses.last.departementCode})</div>
                        </div>
                        {/* <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} >{Math.round(props.data.similarity * 100)}%</div> */}
                    </div>
                </div>
                {/* {HumanReadable && <HumanReadable />} */}
                <div className={cx("stats-container")}>
                    <div className={cx("stats-pie-container")} title='=avg(taux_accord) * 100'>
                        <div style={{ color: "#4D5755", fontWeight: 800, fontSize: "1.75em", textAlign: "center" }}>Score de proximité</div>
                        <div className={cx("c100", "p" + Math.round(scoring.similarity * 100))} style={{ marginTop: "1.5rem" }}>
                            <span>{Math.round(scoring.similarity * 100)} %</span>
                            <div className={cx("slice")}>
                                <div className={cx("bar")}></div>
                                <div className={cx("fill")}></div>
                            </div>
                        </div>
                    </div>
                    <div className={cx("stats-explanation-container")}>
                        <div className={cx("explanation-card")}>
                            <div>Ton <b>taux de proximité</b> avec {deputeResponses.name} est de <u>{Math.round(scoring.similarity * 100)} %</u>.</div>
                            {avgScore && comparison(scoring.similarity * 100, Math.round(avgScore * 100), deputeResponses.name)}
                            {trust(voteCount, deputeResponses)}
                            <div className={cx("link-container")}>
                                <DeputeSocials />
                                <div className={cx("datan-link")}>
                                    <div style={{ fontWeight: 800, color: "#4D5755", fontSize: "1.1em", textAlign: "center" }}>Découvre {deputeResponses.last.civ == "M." ? "ce" : "cette"} député{deputeResponses.last.civ == "M." ? "" : "e"} sur</div>
                                    <a href={deputeResponses["page-url"]} target="_blank">
                                        <img src="/assets/logo_svg.svg" width={120} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={cx("cards-container")}>
                {questions.map(q => {
                    const d = {
                        q,
                        user: userResponses[q.vote_id],
                        depute: deputeResponses.votes[q.vote_id]
                    }
                    return <div className={cx("card")} style={{ display: "flex", flexDirection: "column", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "10px", paddingRight: "10px", width: 300, margin: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 95 }}>
                            <div className={cx("card-title")} style={{ textAlign: "center", padding: 10 }}>{q.voteTitre}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }} title={`taux_accord=${compareToDepute(d.user, d.depute as Reponse | null)}`}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontWeight: "lighter", fontSize: 12, paddingTop: "5px", paddingBottom: "5px", textAlign: "center" }}>{deputeResponses.nameAbbrev}</div>
                                <div>{getButtons(d.depute)}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontWeight: "lighter", fontSize: 12, paddingTop: "5px", paddingBottom: "5px", textAlign: "center" }}>Votre vote</div>
                                <div>{getButtons(d.user)}</div>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
    </div >
    </div >
}
