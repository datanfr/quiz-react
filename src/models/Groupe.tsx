import { fetchQuestions } from "./Question"

import { ReactElement } from "react"

export type GroupeWithVote = {
    "id": string,
    "name": string,
    "page-url": string,
    "member-count": number,
    "picture": ReactElement,
    "votes": Record<string, { positionMajoritaire: string, "pour": number, "contre": number, "abstention": number }>
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
        "VTANR5L15V2948": { positionMajoritaire: "pour", "pour": 12, "contre": 6, "abstention": 2 },
        "VTANR5L15V3484": { positionMajoritaire: "pour", "pour": 12, "contre": 6, "abstention": 2 },
        "VTANR5L15V3485": { positionMajoritaire: "pour", "pour": 12, "contre": 6, "abstention": 2 },
        "VTANR5L15V3486": { positionMajoritaire: "pour", "pour": 12, "contre": 6, "abstention": 2 }
    }
}

const votesPerGroupeeById: Record<string, GroupeWithVote> = {}
Object.assign(window, { votesPerGroupeeById })

export const fetchingVotesPerGroupe = buildGroupes()
export const fetchingGroupes = fetchingVotesPerGroupe.then(x => Object.values(x))

function buildGroupes() {
    return fetchQuestions
        .then(json => {
            //console.log("Size fetched", json.length)
            const promisePerVote: Promise<void>[] = json.map((vote: any) => {
                //console.log("Fetching ", vote.voteNumero)
                return buildGroupe(vote.voteNumero, vote.swap)
            })
            return Promise.all(promisePerVote).then(() => votesPerGroupeeById)
        }).then(votesPerGroupeeById => {
            //SOC = SOC + NG
            votesPerGroupeeById["SOC"] = mergeGroupe(votesPerGroupeeById["SOC"], votesPerGroupeeById["NG"])
            delete votesPerGroupeeById["NG"]

            //SOC = SOC + NG
            votesPerGroupeeById["DEM"] = mergeGroupe(votesPerGroupeeById["DEM"], votesPerGroupeeById["MODEM"])
            delete votesPerGroupeeById["MODEM"]

            // UDI_I = UDI_I + UDI-I + UDI-AGIR
            votesPerGroupeeById["UDI_I"] = mergeGroupe(votesPerGroupeeById["UDI_I"], votesPerGroupeeById["UDI-I"])
            votesPerGroupeeById["UDI_I"] = mergeGroupe(votesPerGroupeeById["UDI_I"], votesPerGroupeeById["UDI-AGIR"])
            votesPerGroupeeById["UDI_I"] = mergeGroupe(votesPerGroupeeById["UDI_I"], votesPerGroupeeById["LC"])

            // AGIR-E = AGIR-E + UDI-AGIR
            votesPerGroupeeById["AGIR-E"] = mergeGroupe(votesPerGroupeeById["AGIR-E"], votesPerGroupeeById["UDI-I"])
            votesPerGroupeeById["AGIR-E"] = mergeGroupe(votesPerGroupeeById["AGIR-E"], votesPerGroupeeById["UDI-AGIR"])
            votesPerGroupeeById["AGIR-E"] = mergeGroupe(votesPerGroupeeById["AGIR-E"], votesPerGroupeeById["LC"])

            delete votesPerGroupeeById["UDI-I"]
            delete votesPerGroupeeById["UDI-AGIR"]
            delete votesPerGroupeeById["LC"]

            console.log({ t: Object.values(votesPerGroupeeById), SOC: votesPerGroupeeById["SOC"], merged: mergeGroupe(votesPerGroupeeById["SOC"], votesPerGroupeeById["SOC"]) })
            return votesPerGroupeeById
        })
}

type Vote = {
    positionMajoritaire: string;
    pour: number;
    contre: number;
    abstention: number;
}

function mergeGroupeVote(v1: Vote, v2: Vote) : Vote {
    return {
        positionMajoritaire: "merged",
        pour: v1.pour + v2.pour,
        contre: v1.contre + v2.contre,
        abstention: v1.abstention + v2.abstention
    }
}

function mergeGroupe(g1: GroupeWithVote, g2: GroupeWithVote): GroupeWithVote {
    const allVotesKeys = [...Object.keys(g1.votes), ...Object.keys(g2.votes)]
    const mergedVotes : Record<string, Vote> = {}
    for (const voteKey of allVotesKeys) {
        const v1 = g1.votes[voteKey]
        const v2 = g2.votes[voteKey]
        if (v1 && v2) {
            mergedVotes[voteKey] = mergeGroupeVote(v1, v2)
        } else if (v1) {
            mergedVotes[voteKey] = v1
        } else if (v2) {
            mergedVotes[voteKey] = v2
        } else {
            mergedVotes[voteKey] = {
                positionMajoritaire: "merged",
                pour: 0,
                contre: 0,
                abstention: 0
            }
        }

    }
    const merged = {
        id: g1.id,
        name: g1.name,
        "page-url": g1["page-url"],
        "member-count": g1["member-count"],
        picture: g1.picture,
        votes: mergedVotes
    }
    console.log({g1, g2, merged})
    return merged;
}

function buildGroupe(id: string, swapPourContre : boolean | undefined) {
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
            for (const { libelleAbrev, libelle, voteNumero, nombreMembresGroupe, nombrePours, nombreContres, nombreAbstentions, nonVotants, nonVotantsVolontaires, positionMajoritaire } of json) {
                const obj = votesPerGroupeeById[libelleAbrev] || {
                    "id": libelleAbrev,
                    "name": libelle,
                    "page-url": `https://datan.fr/groupes/legislature-15/${libelleAbrev.toLowerCase()}`,
                    "picture": <picture>
                        <source srcSet={`https://datan.fr/assets/imgs/groupes/webp/${libelleAbrev}.webp`} type="image/webp" />
                        <source srcSet={`https://datan.fr/assets/imgs/groupes/${libelleAbrev}.png`} type="image/png" />
                        <img src={`https://datan.fr/assets/imgs/groupes/${libelleAbrev}.png`} width="150" height="150" alt={libelleAbrev} />
                    </picture>,
                    "votes": {}
                }
                if (swapPourContre) {
                    obj.votes[`VTANR5L15V${voteNumero}`] = {
                        positionMajoritaire: "swapped",
                        "pour": parseInt(nombreContres),
                        "contre": parseInt(nombrePours),
                        "abstention": parseInt(nombreAbstentions)
                    }
                } else {
                    obj.votes[`VTANR5L15V${voteNumero}`] = {
                        positionMajoritaire,
                        "pour": parseInt(nombrePours),
                        "contre": parseInt(nombreContres),
                        "abstention": parseInt(nombreAbstentions)
                    }

                }
                votesPerGroupeeById[libelleAbrev] = obj
            }
        })
}
