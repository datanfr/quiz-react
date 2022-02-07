import { Reponse } from "./models/Reponse";

// distance = sqrt( (depute_vote1 - user_vote1)**2 + (depute_vote2 - user_vote2)**2 + (depute_voteN - user_voteN)**2 )
// si vote divergent (depute_vote1 - user_vote1)**2 = 1 
// sinon (depute_vote1 - user_vote1)**2 = 0
// donc distance = sqrt(nb_vote_divergent)

const outcomeToScore = {
    "abstention": 0.5,
    "pour": 1,
    "contre": 0
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    if (value === null || value === undefined) return false;
    const testDummy: TValue = value;
    return true;
  }

export function calculateDeputeSimilarity(depute_votes: Record<string, Reponse | null>, user_votes: Record<string, Reponse>) {
    const distanceAndDataPerVote = Object.entries(user_votes).map(([user_vote_id, user_vote_outcome]) => {
        const depute_vote_outcome = depute_votes[user_vote_id]
        const userScore = outcomeToScore[user_vote_outcome]
        const deputeScore = depute_vote_outcome && outcomeToScore[depute_vote_outcome]
        //console.log({user_vote_outcome, depute_vote_outcome, userScore, deputeScore, abs: userScore && deputeScore && Math.abs(userScore - deputeScore)})
        const distance = (userScore != null && deputeScore != null) ? Math.abs(userScore - deputeScore) : null
        return {user_vote_outcome, userScore, depute_vote_outcome, deputeScore, distance}
    })
    const distancePerVote = distanceAndDataPerVote.map(x => x.distance).filter(notEmpty)
    const laplace = [0, 1] //https://youtu.be/8idr1WZ1A7Q?t=110
    const distanceSum = [...distancePerVote, ...laplace].reduce((a, b) => a + b, 0);
    const distanceAvg = distanceSum / (distancePerVote.length + laplace.length)
    const similarity = (1-distanceAvg)
    return {distanceAndDataPerVote, distanceWithLaplace: [...distancePerVote, ...laplace], distanceAvg, similarity}   
}


export function calculateGroupeSimilarity(groupe_votes: Record<string, {pour: number,contre: number,abstention: number}>, user_votes: Record<string, Reponse>) {
    console.log(groupe_votes)
    const distanceAndDataPerVote = Object.entries(user_votes).map(([user_vote_id, user_vote_outcome]) => {
        const groupe_vote_outcome = groupe_votes[user_vote_id]
        const userScore = outcomeToScore[user_vote_outcome]
        const groupeScore = groupe_vote_outcome && (groupe_vote_outcome.pour * outcomeToScore.pour + groupe_vote_outcome.contre * outcomeToScore.contre + groupe_vote_outcome.contre * outcomeToScore.abstention) / (groupe_vote_outcome.pour + groupe_vote_outcome.contre + groupe_vote_outcome.contre)
        //console.log({user_vote_outcome, groupe_vote_outcome, userScore, groupeScore, abs: userScore && groupeScore && Math.abs(userScore - groupeScore)})
        const distance = (userScore != null && groupeScore != null) ? Math.abs(userScore - groupeScore) : null
        return {user_vote_outcome, userScore, groupe_vote_outcome, groupeScore, distance}
    })
    const distancePerVote = distanceAndDataPerVote.map(x => x.distance).filter(notEmpty)
    const laplace = [0, 1] //https://youtu.be/8idr1WZ1A7Q?t=110
    const distanceSum = [...distancePerVote, ...laplace].reduce((a, b) => a + b, 0);
    const distanceAvg = distanceSum / (distancePerVote.length + laplace.length)
    const similarity = (1-distanceAvg)
    return {distanceAndDataPerVote, distanceWithLaplace: [...distancePerVote    ], distanceAvg, similarity}   
}