import {fetchQuestions} from "./Question"

export type DeputeWithVote = {
    "name": string,
    "id": string,
    "page-url": string,
    "groupe_name": string,
    "votes": Record<string, string>,
    last: any
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
    },
    last: {
        
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

// [
//     {
//     mpId: "PA1008",
//     legislature: "15",
//     nameUrl: "alain-david",
//     civ: "M.",
//     nameFirst: "Alain",
//     nameLast: "David",
//     age: "72",
//     job: "Ingénieur",
//     catSocPro: "Cadres d'entreprise",
//     famSocPro: "Cadres et professions intellectuelles supérieures",
//     dptSlug: "gironde-33",
//     departementNom: "Gironde",
//     departementCode: "33",
//     circo: "4",
//     mandatId: "PM722704",
//     libelle: "Socialistes et apparentés",
//     libelleAbrev: "SOC",
//     groupeId: "PO758835",
//     groupeMandat: "PM758843",
//     couleurAssociee: "#D46CA9",
//     dateFin: null,
//     datePriseFonction: "2017-06-21",
//     causeFin: "",
//     img: "1",
//     imgOgp: "1",
//     dateMaj: "2022-02-13",
//     libelle_1: "en ",
//     libelle_2: "du ",
//     active: "1"
//     }
// ]
const fetchDeputeLast = fetch(`https://datan.fr/api/deputes/get_deputes_last?legislature=15`).then(resp => resp.json()).then(deputesLast => {
    const deputeLastByMpId : Record<string, any> = {}
    for (const depute of deputesLast) {
        deputeLastByMpId[depute.mpId as string] = depute
    }
    return deputeLastByMpId
})


function buildDepute(id: number) {
    return Promise.all([fetch(`https://datan.fr/api/votes/get_vote_deputes?num=${id}&legislature=15`).then(resp => resp.json()), fetchDeputeLast])
        .then(([voteDepute, deputeLastByMpId]) => {
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
                const obj : DeputeWithVote = votesPerDeputeById[mpId] || {
                    id: mpId.slice(2),
                    "name": nameFirst + " " + nameLast,
                    "page-url": `https://datan.fr/deputes/${dptSlug}/depute_${nameUrl}`,
                    votes: {},
                    last: deputeLastByMpId[mpId]
                }
                obj.votes[`VTANR5L15V${id}`] = vote_libelle
                votesPerDeputeById[mpId] = obj
            }
        })
}

