import { maxBy } from "lodash";
import { GroupeWithVote } from "../models/Groupe";
import { Questions } from "../models/Question";
import { Reponse } from "../models/Reponse";
import { Algorithm } from "./ScoringAlgorithm";
import { groupe as groupeSimpleLaplace } from "./simple-laplace";

const pc = ["pour", "contre"]
const allCompOutcome = ["accord", "desaccord", "nspp"] as const
type CompOutcome = typeof allCompOutcome[number]

function depute(deputeResponses: Record<string, Reponse | null>, userResponses: Record<string, Reponse>, questions: Questions) {
    const compOutcome = questions.map((q): CompOutcome => {
        const ur = userResponses[q.vote_id];
        const dr = deputeResponses[q.vote_id]
        if (pc.includes(ur) && dr && pc.includes(dr)) {
            return ur === dr ? "accord" : "desaccord"
        } else {
            return "nspp"
        }
    });
    const counts = Object.fromEntries(allCompOutcome.map(o => [o, compOutcome.filter(x => x === o).length])) as Record<CompOutcome, number>
    const calcData = {
        counts,
        confiance: (counts["accord"] + counts["desaccord"]) / compOutcome.length,
        compatibilite: counts["accord"] + counts["desaccord"] > 0 ? counts["accord"] / (counts["accord"] + counts["desaccord"]) : 0
    }
    return {
        calcData, similarity: calcData.confiance * calcData.compatibilite, HumanReadable: () => <pre>
            {JSON.stringify(calcData, null, " ")}
        </pre>
    }
}

export function groupe(groupe: GroupeWithVote, user_votes: Record<string, Reponse>, questions: Questions) {
    const compOutcome = questions.map((q): CompOutcome => {
        const ur = user_votes[q.vote_id];
        if (!groupe.votes[q.vote_id]) console.log("missing data for", q.vote_id, groupe)
        const gr = groupe.votes[q.vote_id]?.positionMajoritaire || "abstention"
        if (pc.includes(ur) && pc.includes(gr)) {
            return ur === gr ? "accord" : "desaccord"
        } else {
            return "nspp"
        }
    });
    const counts = Object.fromEntries(allCompOutcome.map(o => [o, compOutcome.filter(x => x === o).length])) as Record<CompOutcome, number>
    const calcData = {
        counts,
        confiance: (counts["accord"] + counts["desaccord"]) / compOutcome.length,
        compatibilite: counts["accord"] + counts["desaccord"] > 0 ? counts["accord"] / (counts["accord"] + counts["desaccord"]) : 0
    }
    return {
        calcData, similarity: calcData.confiance * calcData.compatibilite, HumanReadable: () => <pre>
            {JSON.stringify(calcData, null, " ")}
        </pre>
    }
}

const algo: Algorithm<
    ReturnType<typeof depute>["calcData"],
    ReturnType<typeof groupe>["calcData"]
> = { depute, groupe}

export default algo