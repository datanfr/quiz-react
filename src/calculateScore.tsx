import { Reponse } from "./models/Reponse";

// distance = sqrt( (depute_vote1 - user_vote1)**2 + (depute_vote2 - user_vote2)**2 + (depute_voteN - user_voteN)**2 )
// si vote divergent (depute_vote1 - user_vote1)**2 = 1 
// sinon (depute_vote1 - user_vote1)**2 = 0
// donc distance = sqrt(nb_vote_divergent)

const outcomeToScore = {
    "nspp": 0.5,
    "absent": null,
    "pour": 1,
    "contre": 0
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    if (value === null || value === undefined) return false;
    const testDummy: TValue = value;
    return true;
  }

export function calculateVoteSimilarity(depute_votes: Record<string, Reponse>, user_votes: Record<string, Reponse>) {
    const distancePerVote = Object.entries(user_votes).map(([user_vote_id, user_vote_outcome]) => {
        const depute_vote_outcome = depute_votes[user_vote_id]
        const userScore = outcomeToScore[user_vote_outcome]
        const deputeScore = outcomeToScore[depute_vote_outcome]
        console.log({user_vote_outcome, depute_vote_outcome, userScore, deputeScore, abs: userScore && deputeScore && Math.abs(userScore - deputeScore)})
        return (userScore != null && deputeScore != null) ? Math.abs(userScore - deputeScore) : null
    }).filter(notEmpty)
    const laplace = [0, 1] //https://youtu.be/8idr1WZ1A7Q?t=110
    const distanceSum = [...distancePerVote, ...laplace].reduce((a, b) => a + b, 0);
    const distanceAvg = distanceSum / (distancePerVote.length + laplace.length)
    const similarity = (1-distanceAvg)
    console.log({
        depute_votes,
        user_votes,
        distancePerVote,
        distanceSum,
        distanceAvg,
        similarity
    })
    return similarity   
}