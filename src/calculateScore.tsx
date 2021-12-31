import { Reponse } from "./models/Reponse";

// distance = sqrt( (depute_vote1 - user_vote1)**2 + (depute_vote2 - user_vote2)**2 + (depute_voteN - user_voteN)**2 )
// si vote divergent (depute_vote1 - user_vote1)**2 = 1 
// sinon (depute_vote1 - user_vote1)**2 = 0
// donc distance = sqrt(nb_vote_divergent)
export function calculateVoteSimilarity(depute_votes: Record<string, Reponse>, user_votes: Record<string, Reponse>) {
    var nb_votes_divergent = 0
    const user_votes_list = Object.entries(user_votes)
    for (const [user_vote_id, user_vote_outcome] of user_votes_list) {
        const depute_vote_outcome = depute_votes[user_vote_id]
        if (depute_vote_outcome !== "nspp" && user_vote_outcome !== "nspp") { //Ignore nspp and absent 
            if (depute_vote_outcome !== user_vote_outcome) nb_votes_divergent++
        }
    }
    const distance = nb_votes_divergent ** 0.5 //[0, max_votes_divergent**0.5]
    const normalised_distance = distance / user_votes_list.length ** 0.5 //[0, 1]
    const similarity = 1 - normalised_distance//[1, 0] closer from 1 => moar similarity
    return similarity
}