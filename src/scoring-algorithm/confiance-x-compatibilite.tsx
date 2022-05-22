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
        if (ur === dr) {
            return 1
        } else if (ur === "abstention" || dr === "abstention") {
            return 0.5
        } else {
            return 0
        }
    } else {
        return 0
    }
}

export function compareToGroupe(ur: Reponse, gr: {pour: number, contre:number, abstention:number}) {
    const pourTauxAccord = compareToDepute(ur, "pour") * gr.pour
    const contreTauxAccord = compareToDepute(ur, "contre") * gr.contre
    const abstentionTauxAccord = compareToDepute(ur, "abstention") * gr.abstention
    const tauxAccord = (pourTauxAccord + contreTauxAccord + abstentionTauxAccord) / (gr.pour + gr.contre + gr.abstention)

    return tauxAccord
}

function depute(deputeResponses: Record<string, Reponse | null>, userResponses: Record<string, Reponse>, questions: Questions) {
    const tauxAccords = questions.map((q): TauxAccord => {
        const ur = userResponses[q.vote_id];
        const dr = deputeResponses[q.vote_id]
        return compareToDepute(ur, dr)
    });
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
    const tauxAccords = questions.map((q): TauxAccord => {
        if (!groupe.votes[q.vote_id]) console.log("missing data for", groupe, q.vote_id)
        const gr = groupe.votes[q.vote_id] || {pour: 0, contre: 0, abstention: 0};
        const ur = user_votes[q.vote_id]
        return compareToGroupe(ur, gr)
    });
    const calcData = {
        tauxAccords,
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