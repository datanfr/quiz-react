import {fetchQuestions} from "./Question"

import { ReactElement } from "react"

export type GroupeWithVote = {
    "id": string,
    "name": string, 
    "page-url": string,
    "member-count": number,
    "picture": ReactElement,
    "votes": Record<string, { "pour": number, "contre": number, "abstention": number }>
}
export const exVoteGroupe: GroupeWithVote = {
    "id": "MoDem",
    "name": "Mouvement Démocrate et apparentés",
    "page-url": "https://datan.fr/groupes/dem",
    "member-count": 256,
    "picture": <picture>
        <source srcSet="https://datan.fr/assets/imgs/groupes/webp/LAREM.webp" type="image/webp" />
        <source srcSet="https://datan.fr/assets/imgs/groupes/LAREM.png" type="image/png" />
        <img src="https://datan.fr/assets/imgs/groupes/LAREM.png" width="150" height="150" alt="La République en Marche" />
    </picture>,
    "votes": {
        "VTANR5L15V2948": { "pour": 12, "contre": 6, "abstention": 2},
        "VTANR5L15V3484": { "pour": 12, "contre": 6, "abstention": 2},
        "VTANR5L15V3485": { "pour": 12, "contre": 6, "abstention": 2},
        "VTANR5L15V3486": { "pour": 12, "contre": 6, "abstention": 2}
    }
}

const votesPerGroupeeById: Record<string, GroupeWithVote> = {}
Object.assign(window, { votesPerGroupeeById })

export function buildGroupes() {
    return fetchQuestions
        .then(json => {
            //console.log("Size fetched", json.length)
            const promisePerVote: Promise<void>[] = json.map((vote: any) => {
                //console.log("Fetching ", vote.voteNumero)
                return buildGroupe(vote.voteNumero)
            })
            return Promise.all(promisePerVote).then(() => votesPerGroupeeById)
        })
}


function buildGroupe(id: number) {
    return fetch(`https://datan.fr/api/votes/get_vote_groupes_simplified?num=${id}&legislature=15`)
        .then(resp => resp.json())
        .then(json => {
            // [
            // {
            //     libelleAbrev: "LAREM",
            //     libelle: "La République en Marche"
            //     voteId: "VTANR5L15V1",
            //     voteNumero: "1",
            //     legislature: "15",
            //     organeRef: "PO730964",
            //     nombreMembresGroupe: "314",
            //     positionMajoritaire: "pour",
            //     nombrePours: "305",
            //     nombreContres: "0",
            //     nombreAbstentions: "0",
            //     nonVotants: "8",
            //     nonVotantsVolontaires: "0"
            //     }
            // ]
            for (const {libelleAbrev, libelle, voteNumero, nombreMembresGroupe, nombrePours, nombreContres, nombreAbstentions} of json) {
                const obj = votesPerGroupeeById[libelleAbrev] || {
                    "id": libelleAbrev,
                    "name": libelle,
                    "page-url": `https://datan.fr/groupes/legislature-15/${libelleAbrev}`,
                    "member-count": nombreMembresGroupe,
                    "picture": <picture>
                        <source srcSet={`https://datan.fr/assets/imgs/groupes/webp/${libelleAbrev}.webp`} type="image/webp" />
                        <source srcSet={`https://datan.fr/assets/imgs/groupes/${libelleAbrev}.png`} type="image/png" />
                        <img src={`https://datan.fr/assets/imgs/groupes/${libelleAbrev}.png`} width="150" height="150" alt={libelleAbrev }/>
                    </picture>,
                    "votes": {}
                }
                obj.votes[`VTANR5L15V${voteNumero}`] = { "pour": nombrePours, "contre": nombreContres, "abstention": nombreAbstentions}
                votesPerGroupeeById[libelleAbrev] = obj
            }
        })
}