import { IonPage } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useHistory, useLocation, useParams } from "react-router"
import Header from "../components/Header"
import { DeputeWithScore, DeputeWithVote, fetchingVotesPerDepute } from "../models/Depute"
import { fetchQuestions, Questions } from "../models/Question"
import { getResponses, Reponse } from "../models/Reponse"
import classNames from 'classnames/bind';
import classes from './DeputeStats.module.css';
import { counter } from "@fortawesome/fontawesome-svg-core"
import { groupBy, Hwb, hwb, hwbLerp, hwbToCss } from "../utils"
import { algorithms as scoringAlgorithms, algorithmsNames, algoFromString } from '../scoring-algorithm/ScoringAlgorithm';
import { fetchingVotesPerGroupe, GroupeWithVote } from "../models/Groupe"
import { compareToGroupe } from "../scoring-algorithm/confiance-x-compatibilite"
import { DeputeSocials } from "../components/DeputeSocial"

let cx = classNames.bind(classes);



const nspp = <div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
>
    <span style={{fontWeight: 800}}>SANS&nbsp;AVIS</span>
</div>

const contre = <div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
>
    <span style={{fontWeight: 800}}>CONTRE</span>
</div>

const pour = < div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
>
    <span style={{fontWeight: 800}}>POUR</span>
</div >

function trust(s: number) {
  if (s <= 15) {
    return <div><b>Attention</b>, ce score n'est basé uniquement sur {s} votes car le groupe n'était pas tout le temps présent pour voter. <span style={{color: "red", fontWeight: 800}}>Ce score est donc à prendre avec précaution</span>.</div>
  } else {
    return <div>Ce score est basé sur {s} questions. Nous considérons que c'est suffisant pour le calcul du score de proximité.</div>
  }
}

function comparison(score: number, average: number, groupe: string) {
  if (score == average) {
    return <div>Comparé aux autres groupes, vos positions politiques <span style={{fontWeight: 800, color: "var(--datan-green)"}}>sont relativement proches</span> de celles du groupe {groupe}.</div>
  } else if (score < average) {
    return <div>Comparé aux autres groupes, vos positions politiques <span style={{fontWeight: 800, color: "var(--datan-red)"}}>ne sont pas proches</span> de celles du groupe {groupe}.</div>
  } else {
    return <div>Comparé aux autres groupes, vos positions politiques <span style={{fontWeight: 800, color: "var(--datan-green)"}}>sont proches</span> de celles du groupe {groupe}.</div>
  }
}

function getButtons(s: string) {
    switch (s) {
        case "pour": return pour
        case "contre": return contre
        default: return nspp
    }
}

const SingleGroupeButton: React.FC<{ value: number, total: number, txt: string, color: Hwb }> = ({ value, total, txt, color }) => {
    let greyedColor = Object.assign({}, color, { w: 0.5, b: 0.5 });
    if (total != 0) {
        const taux = value / total
        greyedColor = hwbLerp(taux, { start: greyedColor, end: color })
        console.log({ txt, taux, color })
    }

    return <div
        style={{ backgroundColor: hwbToCss(greyedColor), display: "flex", flexDirection: "column", width: "33%" }}
        className={cx("flex", "align-justify-center", "osef")}

    >
        <div style={{fontWeight: 800, textAlign: "center"}}>{value}</div>
        <div style={{ fontSize: 8, textAlign: "center" }}>{txt}</div>
    </div>
}

function groupeButtons({ pour, contre, abstention }: {
    "pour": number;
    "contre": number;
    "abstention": number;
}) {
    const total = pour + contre + abstention
    console.log({ pour, contre, abstention, total})
    return <div className={cx("button", "shadow")} style={{ display: "flex", width: 130, borderRadius: "10px", overflow: "hidden" }}>
        <SingleGroupeButton value={pour} total={total} txt="POUR" color={hwb.green} />
        <SingleGroupeButton value={abstention} total={total} txt="SANS&nbsp;AVIS" color={hwb.yellow} />
        <SingleGroupeButton value={contre} total={total} txt="CONTRE" color={hwb.red} />
    </div>
}

type GroupeStatsData = {
    userResponses: Record<string, Reponse>;
    groupeResponses: GroupeWithVote;
    questions: Questions;
}

export const GroupeStatsPage: React.FC = () => {
    const fetchingResponses = getResponses()
    const history = useHistory()
    const location = useLocation<{ avgScoreGroupe: number | null }>()
    const avgScoreGroupe = location.state.avgScoreGroupe
    const [groupeStats, setGroupeStats] = useState<GroupeStatsData | null>(null)
    const { id } = useParams<{ id: string }>();
    useEffect(() => {
        Promise.all([fetchingResponses, fetchingVotesPerGroupe, fetchQuestions]).then(([userResponses, votesPerGroupe, questions]) => {
            const groupeResponses = votesPerGroupe[id]
            setGroupeStats({
                userResponses,
                groupeResponses,
                questions
            })
        })
    }, [])

    return <IonPage>
        {groupeStats ? <GroupeStats groupeStats={groupeStats} avgScoreGroupe={avgScoreGroupe} /> : "Loading data"}
        <Header onBackClick={() => history.goBack()} title={`Résultat`} />
    </IonPage>
}

const pc = ["pour", "contre"]
const allCompOutcome = ["accord", "desaccord", "nspp"] as const
type CompOutcome = typeof allCompOutcome[number]

export const GroupeStats: React.FC<{ groupeStats: GroupeStatsData, avgScoreGroupe: number | null }> = ({ groupeStats: { groupeResponses, userResponses, questions }, avgScoreGroupe }) => {
    const algorithmName = algoFromString(new URLSearchParams(window.location.search).get("algorithm"), () => "confianceXCompatibilite")
    console.log({ algorithmName })
    const scoringAlgorithm = scoringAlgorithms[algorithmName]
    const scoring = scoringAlgorithm.groupe(groupeResponses, userResponses, questions)
    const HumanReadable = scoring.HumanReadable
    const voteCount = Object.values(groupeResponses.votes).length
    // const badgeBgColor = hwbLerp(props.data.similarity)
    return <div style={{ overflow: "auto" }}><div className={cx("center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "160px", justifyContent: "space-evenly" }}>
                <div className={cx("profile-container")}>
                    <div className={cx("profile")}>
                        <div className={cx("picture-container")}>
                            <div className={cx("groupe-img-circle")}>
                                {groupeResponses.picture}
                            </div>
                        </div>
                        <div className={cx("data-container")}>
                            <div>
                                <div className={cx("title")} style={{ fontSize: (4 / (groupeResponses.name.length ** 0.30)) + "em" }}>{groupeResponses.name}</div>
                                <div className={cx("district")}>{groupeResponses.id}</div>
                            </div>
                        </div>
                        {/* <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} >{Math.round(props.data.similarity * 100)}%</div> */}
                    </div>
                </div>
                <div className={cx("stats-container")}>
                    <div className={cx("stats-pie-container")} title='=avg(taux_accord) * 100'>
                        <div style={{color: "#4D5755", fontWeight: 800, fontSize: "1.75em", textAlign: "center"}}>Score de proximité</div>
                        <div className={cx("c100", "p" + Math.round(scoring.similarity * 100) )} style={{marginTop: "1.5rem"}}>
                            <span>{Math.round(scoring.similarity * 100)} %</span>
                            <div className={cx("slice")}>
                                <div className={cx("bar")}></div>
                                <div className={cx("fill")}></div>
                            </div>
                        </div>
                    </div>
                    <div className={cx("stats-explanation-container")}>
                        <div className={cx("explanation-card")}>
                            <div style={{fontWeight: 800, color: "#4D5755", fontSize: "1.2em"}}>Explication</div>
                            <div>Votre <b>taux de proximité</b> avec le groupe {groupeResponses.name} ({groupeResponses.id}) est de {Math.round(scoring.similarity * 100)} %.</div>
                            <div>Autrement dit, sur vos réponses aux questions du quizz, vous avez la même position politique que le groupe {groupeResponses.id} dans {Math.round(scoring.similarity * 100)} % des cas.</div>
                            {avgScoreGroupe && comparison(scoring.similarity * 100, Math.round(avgScoreGroupe * 100), groupeResponses.id)}
                            {trust(voteCount)}
                            <a className={cx("link-container")} target="_blank">
                                <DeputeSocials />
                                <div className={cx("datan-link")}>
                                    <div style={{fontWeight: 800, color: "#4D5755", fontSize: "1.1em", textAlign: "center"}}>En savoir plus sur</div>
                                    <a href={groupeResponses["page-url"]} target="_blank">
                                        <img src="/assets/logo_svg.svg" width={120} />
                                    </a>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div>
                Score:
                {HumanReadable && <HumanReadable />}
            </div> */}
            <div className={cx("cards-container")}>
                {questions.map(q => {
                    const d = {
                        q,
                        user: userResponses[q.vote_id],
                        groupe: groupeResponses.votes[q.vote_id] || { pour: 0, contre: 0, abstention: 0 }
                    }
                    return <div className={(cx("card"))} style={{ display: "flex", flexDirection: "column", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "10px", paddingRight: "10px", width: 300, margin: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 88 }}>
                            <div className={cx("card-title")} style={{ textAlign: "center", padding: 10 }}>{q.voteTitre}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }} title={`taux_accord=${compareToGroupe(d.user, d.groupe)}`}>
                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                <div style={{ fontWeight: "lighter", fontSize: 12, paddingTop: "5px", paddingBottom: "5px",  textAlign: "center" }}>Le groupe</div>
                                <div>{groupeButtons(d.groupe)}</div>
                            </div>
                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                <div style={{ fontWeight: "lighter", fontSize: 12, paddingTop: "5px", paddingBottom: "5px", textAlign: "center" }}>Votre vote</div>
                                <div>{getButtons(d.user)}</div>
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
    </div>
    </div>
}
