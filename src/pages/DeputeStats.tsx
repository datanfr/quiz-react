import { IonPage } from "@ionic/react"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import Header from "../components/Header"
import {DeputeWithScore, DeputeWithVote, fetchingVotesPerDepute } from "../models/Depute"
import { fetchQuestions, Questions } from "../models/Question"
import { getResponses, Reponse } from "../models/Reponse"

type DeputeStatsData = {
    userResponses: Record<string, Reponse>;
    deputeResponses: DeputeWithVote;
    questions: Questions;
}

export const DeputeStatsPage : React.FC = () => {
    const fetchingResponses = getResponses()

    const [deputeStats, setDeputeStats] = useState<DeputeStatsData | null>(null)
    const { mpId } = useParams<{mpId:string}>();
    useEffect(() => {
        Promise.all([fetchingResponses, fetchingVotesPerDepute, fetchQuestions]).then(([userResponses, votesPerDepute, questions]) => {
            const deputeResponses = votesPerDepute["PA"+mpId]
            setDeputeStats({
                userResponses,
                deputeResponses,
                questions
            })
        })
    })

    return <IonPage>
        <Header title={`Résultat`} />
        {deputeStats ? <DeputeStats deputeStats={deputeStats}  /> : "Loading data" }
    </IonPage>
}

export const DeputeStats : React.FC<{deputeStats : DeputeStatsData}> = ({deputeStats}) => {
    return <pre>
        {JSON.stringify(deputeStats, null, ' ')}
    </pre>
}