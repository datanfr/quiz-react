import { Questions } from "../models/Question";
import { Reponse } from "../models/Reponse";
import { groupe as groupeSimpleLaplace } from "./simple-laplace";

const pc = ["pour", "contre"]
const allCompOutcome = ["accord", "desaccord", "nspp"] as const
type CompOutcome = typeof allCompOutcome[number]

function depute(deputeResponses: Record<string, Reponse | null>, userResponses: Record<string, Reponse>, questions : Questions ) {
    const compOutcome = questions.map((q) : CompOutcome => {
        const ur = userResponses[q.vote_id];
        const dr = deputeResponses[q.vote_id]
        if (pc.includes(ur) && dr && pc.includes(dr)) {
            return ur === dr ? "accord" : "desaccord"
        } else {
            return "nspp"
        }
    });
    const counts = Object.fromEntries(allCompOutcome.map(o => [o, compOutcome.filter(x => x === o).length])) as Record<CompOutcome, number>
    const calcData : any = {
        counts,
        confiance: (counts["accord"] + counts["desaccord"]) / compOutcome.length,
        compatibilite: counts["accord"] / (counts["accord"] + counts["desaccord"])
    }
    return {calcData, similarity: calcData.confiance * calcData.compatibilite}
}

export default {depute, groupe:groupeSimpleLaplace}