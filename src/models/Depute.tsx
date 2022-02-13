import {fetchQuestions} from "./Question"

export type DeputeWithVote = {
    "name": string,
    "id": string,
    "page-url": string,
    "groupe_name": string,
    "votes": Record<string, string>
}

export const exVoteDepute: DeputeWithVote = {
    "name": "Damien Abad",
    "id": "605036",
    "page-url": "https://datan.fr/deputes/ain-01/depute_damien-abad",
    "groupe_name": "MoDem",
    "votes": {
        "VTANR5L15V2948": "pour", //Equivalent to {"pour": 1,"contre": 0,"absent": 0,"nspp": 0}
        "VTANR5L15V3484": "contre",
        "VTANR5L15V3486": "abstention"
    }
}



const votesPerDeputeById: Record<string, DeputeWithVote> = {}
Object.assign(window, { votesPerDeputeById })

export function buildDeputes() {
    return fetchQuestions
        .then(json => {
            console.log("Size fetched", json.length)
            const promisePerVote: Promise<void>[] = json.map((vote: any) => {
                console.log("Fetching ", vote.voteNumero)
                return buildDepute(vote.voteNumero)
            })
            return Promise.all(promisePerVote).then(() => votesPerDeputeById)
        })
}


const fetchDeputeLast = fetch(`https://datan.fr/api/deputes/get_deputes_last?legislature=15`).then(resp => resp.json())


function buildDepute(id: number) {
    return Promise.all([fetch(`https://datan.fr/api/votes/get_vote_deputes?num=${id}&legislature=15`).then(resp => resp.json()), fetchDeputeLast])
        .then(([voteDepute, deputeLast]) => {
            // [
            //     {
            //         "mpId": "PA605036",
            //         "vote": "1",
            //         "mandatId": "PM731292",
            //         "scoreLoyaute": "1", 
            //         "legislature": "15",
            //         "vote_libelle": "pour",
            //         "loyaute_libelle": "loyal",
            //         "nameFirst": "Damien",
            //         "nameLast": "Abad",
            //         "nameUrl": "damien-abad",
            //         "dptSlug": "ain-01",
            //         "libelle": "Les R\u00e9publicains",
            //         "libelleAbrev": "LR"
            //     }
            // }
            for (const { mpId, nameFirst, nameLast, vote_libelle, dptSlug, nameUrl } of voteDepute) {
                const obj = votesPerDeputeById[mpId] || {
                    id: mpId.slice(2),
                    "name": nameFirst + " " + nameLast,
                    "page-url": `https://datan.fr/deputes/${dptSlug}/depute_${nameUrl}`,
                    votes: {}
                }
                obj.votes[`VTANR5L15V${id}`] = vote_libelle
                votesPerDeputeById[mpId] = obj
            }
        })
}

