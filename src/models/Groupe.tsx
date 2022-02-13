import {fetchQuestions} from "./Question"

import { ReactElement } from "react"

export type GroupeWithVote = {
    "id": string,
    "page-url": string,
    "member-count": number,
    "picture": ReactElement,
    "votes": Record<string, { "pour": number, "contre": number, "abstention": number }>
}
export const exVoteGroupe: GroupeWithVote = {
    "id": "MoDem",
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
    return fetchQuestions()
        .then(json => {
            // {
            //     "voteTitre": "Autoriser l'utilisation des pesticides n\u00e9onicotino\u00efdes jusqu'en 2023",
            //     "dateScrutin": "2020-10-06",
            //     "dateScrutinFR": "06 octobre 2020",
            //     "voteNumero": "2940",
            //     "legislature": "15",
            //     "category_name": "Environnement",
            //     "category_slug": "environnement",
            //     "sortCode": "adopt\u00e9",
            //     "vote_id": "VTANR5L15V2940",
            //     "arguments": [
            //         {
            //             "opinion": "POUR",
            //             "texte": "Ces pesticides permettent de lutter contre la jaunisse, une maladie touchant fortement les betteraves et impactant leur rendement."
            //         },
            //         {
            //             "opinion": "POUR",
            //             "texte": "La betterave surtout \u00e0 la production de sucre. Une baisse de rendement aurait un co\u00fbt \u00e9conomique important pour cette fili\u00e8re industrielle."
            //         },
            //         {
            //             "opinion": "POUR",
            //             "texte": "En cas de baisse de la production de sucre fran\u00e7ais, le pays devra en important d'autres pays avec des r\u00e8gles environnementales moins strictes."
            //         },
            //         {
            //             "opinion": "CONTRE",
            //             "texte": "Les pesticides n\u00e9onicotino\u00efdes sont consid\u00e9r\u00e9s comme dangereux pour les insectes, et notamment les abeilles."
            //         },
            //         {
            //             "opinion": "CONTRE",
            //             "texte": "Les effets de cet insecticide se ressentent sur plusieurs ann\u00e9es. Les n\u00e9onicotino\u00efdes contaminent la terre des champs et donc les cultures suivantes, mais \u00e9galement les ruisseaux et les nappes phr\u00e9atiques."
            //         },
            //         {
            //             "opinion": "CONTRE",
            //             "texte": "La fragilit\u00e9 \u00e9conomique de la betterave n\u2019est pas seulement due \u00e0 la maladie de la jaunisse, mais \u00e0 la fin des quotas sucriers et des prix minimums."
            //         }
            //     ]
            // },
            console.log("Size fetched", json.length)
            const promisePerVote: Promise<void>[] = json.map((vote: any) => {
                console.log("Fetching ", vote.voteNumero)
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
            for (const {libelleAbrev, voteNumero, nombreMembresGroupe, nombrePours, nombreContres, nombreAbstentions} of json) {
                const obj = votesPerGroupeeById[libelleAbrev] || {
                    "id": libelleAbrev,
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