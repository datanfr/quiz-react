import { IonPage } from "@ionic/react"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import Header from "../components/Header"
import { DeputeWithScore, DeputeWithVote, fetchingVotesPerDepute } from "../models/Depute"
import { fetchQuestions, Questions } from "../models/Question"
import { getResponses, Reponse } from "../models/Reponse"
import classNames from 'classnames/bind';
import classes from './DeputeStats.module.css';
import { counter } from "@fortawesome/fontawesome-svg-core"

let cx = classNames.bind(classes);

const nspp = <div
    className={cx("flex", "align-justify-center", "shadow", "button", "osef")}
>
    SANS&nbsp;AVIS
</div>

const contre = <div
    className={cx("flex", "align-justify-center", "shadow", "button", "contre")}
>
    CONTRE
</div>

const pour = < div
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

type DeputeStatsData = {
    userResponses: Record<string, Reponse>;
    deputeResponses: DeputeWithVote;
    questions: Questions;
}

export const DeputeStatsPage: React.FC = () => {
    const fetchingResponses = getResponses()
    const history = useHistory()
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
        {deputeStats ? <DeputeStats deputeStats={deputeStats} /> : "Loading data"}
        <Header onBackClick={() => history.goBack()} title={`Résultat`} />
    </IonPage>
}

export const DeputeStats: React.FC<{ deputeStats: DeputeStatsData }> = ({ deputeStats: { deputeResponses, userResponses, questions } }) => {
    // const badgeBgColor = hwbLerp(props.data.similarity)
    const groupColor = deputeResponses.last.couleurAssociee as string

    return <div style={{ overflow: "auto" }}><div className={cx("center-body")} style={{gridTemplateColumns: "auto minmax(0, 1920px) auto"}}>
        <div className={cx("body")} style={{ marginTop: "var(--header-height)"}}>
            <div style={{ display: "flex", flexDirection: "column", height: "30vh", minHeight: "160px", justifyContent: "space-evenly" }}>
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
                            <div>
                                <div className={cx("title")} style={{ fontSize: (4 / (deputeResponses.name.length ** 0.30)) + "em" }}>{deputeResponses.name}</div>
                                <div className={cx("groupe")} style={{ color: groupColor }}>{deputeResponses.last.libelle}</div>
                            </div>
                        </div>
                        {/* <div className={cx("badge")} style={{ backgroundColor: hwbToCss(badgeBgColor) }} >{Math.round(props.data.similarity * 100)}%</div> */}
                    </div>
                </div>
                <a className={cx("datan-link-container")} href={deputeResponses["page-url"]} target="_blank">
                    <div className={cx("datan-link")}>
                        <span>EN SAVOIR PLUS SUR</span>&nbsp;&nbsp;<img src="/assets/logo_svg.svg" width={120} />
                    </div>
                </a>
            </div>
            <div className={cx("cards-container")}>
                {questions.map(q => {
                    const d = {
                        q,
                        user: userResponses[q.vote_id],
                        depute: deputeResponses.votes[q.vote_id]
                    }
                    return <div style={{ display: "flex", flexDirection: "column", padding: "10px", width: 300, margin: 10, boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.52)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 88 }}>
                            <div style={{ textAlign: "center", padding: 10 }}>{q.voteTitre}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
                            <div>
                                <div style={{ fontWeight: "lighter", fontSize: 12 }}>le députée</div>
                                {getButtons(d.depute)}
                            </div>
                            <div>
                                <div style={{ fontWeight: "lighter", fontSize: 12 }}>vous</div>
                                {getButtons(d.user)}
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
    </div>
    </div>
}