import { maxBy } from "lodash";
import { GroupeWithVote } from "../models/Groupe";
import { Questions } from "../models/Question";
import { Reponse } from "../models/Reponse";
import { Algorithm } from "./ScoringAlgorithm";
import { groupe as groupeSimpleLaplace } from "./simple-laplace";

const pc = ["pour", "contre", "abstention"]
type TauxAccord = number

export function compareToDepute(ur: Reponse, dr: Reponse | null) {
    if (pc.includes(ur) && dr && pc.includes(dr)) {
        return compareToNonNullDepute(ur, dr)
    } else {
        return null
    }
}

export function compareToNonNullDepute(ur: Reponse, dr: Reponse) {
    if (ur === dr) {
        return 1
    } else if (ur === "abstention" || dr === "abstention") {
        return 0.5
    } else {
        return 0
    }
}

export function compareToGroupe(ur: Reponse, gr: {pour: number, contre:number, abstention:number} | null | undefined) {
    if (gr == null || gr == undefined) return null
    if (gr.pour + gr.contre + gr.abstention <= 0) return null
    const pourTauxAccord = compareToNonNullDepute(ur, "pour") * gr.pour
    const contreTauxAccord = compareToNonNullDepute(ur, "contre") * gr.contre
    const abstentionTauxAccord = compareToNonNullDepute(ur, "abstention") * gr.abstention
    const tauxAccord = (pourTauxAccord + contreTauxAccord + abstentionTauxAccord) / (gr.pour + gr.contre + gr.abstention)
    return tauxAccord
}

function depute(deputeResponses: Record<string, Reponse | null>, userResponses: Record<string, Reponse>, questions: Questions) {
    const tauxAccords = questions.map((q): TauxAccord | null => {
        const ur = userResponses[q.vote_id];
        const dr = deputeResponses[q.vote_id]
        return compareToDepute(ur, dr)
    }).filter(u => u != null) as TauxAccord[];
    const calcData = {
        tauxAccords,
        "formula": "sum(tauxAccords) / nb_vote"
    }
    return {
        calcData, similarity: tauxAccords.reduce((a,b) => a + b) / tauxAccords.length, HumanReadable: () => <pre>
            {JSON.stringify(calcData, null, " ")}
        </pre>
    }
}

export function groupe(groupe: GroupeWithVote, user_votes: Record<string, Reponse>, questions: Questions) {
    const tauxAccordsWithNull = questions.map((q): TauxAccord | null => {
        if (!groupe.votes[q.vote_id]) console.log("missing data for", groupe, q.vote_id)
        const gr = groupe.votes[q.vote_id];
        const ur = user_votes[q.vote_id]
        return compareToGroupe(ur, gr)
    })


    const tauxAccords = tauxAccordsWithNull.filter(x => x != null) as TauxAccord[];
    const tauxConfiance = tauxAccords.length / tauxAccordsWithNull.length
    const calcData = {
        tauxAccords,
        tauxConfiance,
        "formula": "avg(tauxAccords) / nb_vote"
    }
    return {
        calcData, similarity: tauxAccords.reduce((a,b) => a + b) / tauxAccords.length, HumanReadable: () => <div>
            <pre>
                {JSON.stringify(calcData, null, " ")}
            </pre>
        </div>
    }
}

const algo: Algorithm<
    ReturnType<typeof depute>["calcData"],
    ReturnType<typeof groupe>["calcData"]
> = { depute, groupe}

export default algo