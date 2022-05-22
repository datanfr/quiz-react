import { IonPage } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useHistory, useParams } from "react-router"
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

let cx = classNames.bind(classes);



const nspp = <div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
>
    SANS&nbsp;AVIS
</div>

const contre = <div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
>
    CONTRE
</div>

const pour = < div
    style={{ width: 130 }}
    className={cx("flex", "align-justify-center", "shadow", "button", "pour")}
>
    POUR
</div >

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
        className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
    >
        <div>{value}</div>
        <div style={{ fontSize: 8 }}>{txt}</div>
    </div>
}

function groupeButtons({ pour, contre, abstention }: {
    "pour": number;
    "contre": number;
    "abstention": number;
}) {
    const total = pour + contre + abstention
    console.log({ pour, contre, abstention, total })
    return <div style={{ display: "flex", width: 130 }}>
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
        {groupeStats ? <GroupeStats groupeStats={groupeStats} /> : "Loading data"}
        <Header onBackClick={() => history.goBack()} title={`Résultat`} />
    </IonPage>
}

const pc = ["pour", "contre"]
const allCompOutcome = ["accord", "desaccord", "nspp"] as const
type CompOutcome = typeof allCompOutcome[number]

export const GroupeStats: React.FC<{ groupeStats: GroupeStatsData }> = ({ groupeStats: { groupeResponses, userResponses, questions } }) => {
    const scoreHumanReadableRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<any>({});
    useEffect(() => {
        if (scoreHumanReadableRef?.current) {
            console.log({ height: scoreHumanReadableRef.current.offsetHeight })
            if (scoreHumanReadableRef.current.offsetHeight > 20) {
                setStyle({ border: "1px solid red" })
            }
        }
    }, [])
    const algorithmName = algoFromString(new URLSearchParams(window.location.search).get("algorithm"), () => "confianceXCompatibilite")
    console.log({ algorithmName })
    const scoringAlgorithm = scoringAlgorithms[algorithmName]
    const scoring = scoringAlgorithm.groupe(groupeResponses, userResponses, questions)
    const HumanReadable = scoring.HumanReadable
    // const badgeBgColor = hwbLerp(props.data.similarity)
    return <div style={{ overflow: "auto" }}><div className={cx("center-body")} style={{ gridTemplateColumns: "auto minmax(0, 1920px) auto" }}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "30vh", minHeight: "160px", justifyContent: "space-evenly" }}>
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
                            </div>
                        </div>
                        {/* <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} >{Math.round(props.data.similarity * 100)}%</div> */}
                    </div>
                </div>
                <a className={cx("datan-link-container")} href={groupeResponses["page-url"]} target="_blank">
                    <div className={cx("datan-link")}>
                        <span>EN SAVOIR PLUS SUR</span>&nbsp;&nbsp;<img src="/assets/logo_svg.svg" width={120} />
                    </div>
                </a>
            </div>
            <div ref={scoreHumanReadableRef} style={style}>
                Score:
                {HumanReadable && <HumanReadable />}
            </div>
            <div className={cx("cards-container")}>
                {questions.map(q => {
                    const d = {
                        q,
                        user: userResponses[q.vote_id],
                        groupe: groupeResponses.votes[q.vote_id] || { pour: 0, contre: 0, abstention: 0 }
                    }
                    return <div style={{ display: "flex", flexDirection: "column", padding: "10px", width: 300, margin: 10, boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.52)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 88 }}>
                            <div style={{ textAlign: "center", padding: 10 }}>{q.voteTitre}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
                            <div>
                                <div style={{ fontWeight: "lighter", fontSize: 12 }}>le groupe</div>
                                {groupeButtons(d.groupe)}
                            </div>
                            <div>
                                <div style={{ fontWeight: "lighter", fontSize: 12 }}>vous</div>
                                {getButtons(d.user)}
                            </div>
                        </div>
                        <div>taux d'accord: {compareToGroupe(d.user, d.groupe)}</div>
                    </div>
                })}
            </div>
        </div>
    </div>
    </div>
}