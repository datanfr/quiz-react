import { fetchQuestions } from "./Question"
import { Reponse } from "./Reponse"
import { Plugins } from '@capacitor/core';
import { buildIndex, search, Index as SearchIndex, SearchResponse } from "../searchAlgo";
const { Storage } = Plugins;

const exempleDeputeLast = {
    mpId: "PA1008",
    legislature: "15",
    nameUrl: "alain-david",
    civ: "M.",
    nameFirst: "Alain",
    nameLast: "David",
    age: "72",
    job: "Ingénieur",
    catSocPro: "Cadres d'entreprise",
    famSocPro: "Cadres et professions intellectuelles supérieures",
    dptSlug: "gironde-33",
    departementNom: "Gironde",
    departementCode: "33",
    circo: "4",
    mandatId: "PM722704",
    libelle: "Socialistes et apparentés",
    libelleAbrev: "SOC",
    groupeId: "PO758835",
    groupeMandat: "PM758843",
    couleurAssociee: "#D46CA9",
    dateFin: null,
    datePriseFonction: "2017-06-21",
    causeFin: "",
    img: "1",
    imgOgp: "1",
    dateMaj: "2022-02-13",
    libelle_1: "en ",
    libelle_2: "du ",
    active: "1"
}

type DeputeLast = typeof exempleDeputeLast

const exempleVoteDepute = {
    "mpId": "PA605036",
    "vote": "1",
    "mandatId": "PM731292",
    "scoreLoyaute": "1",
    "legislature": "15",
    "vote_libelle": "pour",
    "loyaute_libelle": "loyal",
    "nameFirst": "Damien",
    "nameLast": "Abad",
    "nameUrl": "damien-abad",
    "dptSlug": "ain-01",
    "libelle": "Les R\u00e9publicains",
    "libelleAbrev": "LR"
}
type VoteDepute = typeof exempleVoteDepute

const exempleMpCity = {
    mpId: "PA720568",
    communeNom: "Abancourt",
    codePostal: "60220",
    indexedName: "Abancourt (60220)"
}

type MpCity = typeof exempleMpCity

export type DeputeWithVote = {
    "name": string,
    "id": string,
    "page-url": string,
    "groupe_name": string,
    "votes": Record<string, string>,
    nameAbbrev : string,
    last: DeputeLast,
    cities: MpCity[]
}


// export const exVoteDepute: DeputeWithVote = {
//     "name": "Damien Abad",
//     "id": "605036",
//     "page-url": "https://datan.fr/deputes/ain-01/depute_damien-abad",
//     "groupe_name": "MoDem",
//     "votes": {
//         "VTANR5L15V2948": "pour", //Equivalent to {"pour": 1,"contre": 0,"absent": 0,"nspp": 0}
//         "VTANR5L15V3484": "contre",
//         "VTANR5L15V3486": "abstention"
//     },
//     last: {

//     }
// }

export type DeputeWithScore = {
    distanceAndDataPerVote: {
        user_vote_outcome: Reponse;
        userScore: number;
        depute_vote_outcome: Reponse | null;
        deputeScore: number | null;
        distance: number | null;
    }[];
    distanceWithLaplace: number[];
    distanceAvg: number;
    similarity: number;
    depute: DeputeWithVote;
}





const votesPerDeputeById: Record<string, DeputeWithVote> = {}
Object.assign(window, { votesPerDeputeById })

export const fetchingVotesPerDepute = buildDeputes()
export const fetchingDeputes = fetchingVotesPerDepute.then(x => Object.values(x))
export const buildDeputeIndex = fetchingDeputes.then(deputes => buildIndex(deputes/*, sortedGroupes*/))

const swapPourContreMap : Record<string, string> = {
    "pour": "contre",
    "contre": "pour",
    "abstention": "abstention"
}

function buildDeputes() {
    return fetchQuestions
        .then(json => {
            //console.log("Size fetched", json.length)
            const promisePerVote: Promise<void[]>[] = json.map((vote: any) => {
                //console.log("Fetching ", vote.voteNumero)
                return buildDepute(vote.voteNumero, vote.swap)
            })
            console.log("Starting building vote per depute")
            return Promise.all(promisePerVote).then(() => {
                console.log("Ending building vote per depute")
                return votesPerDeputeById
            })
        })
}

const fetchDeputeLast = fetch(`https://datan.fr/api/deputes/get_deputes_last?legislature=15`).then(resp => resp.json()).then(deputesLast => {
    const deputeLastByMpId: Record<string, DeputeLast> = {}
    for (const depute of deputesLast as DeputeLast[]) {
        deputeLastByMpId[depute.mpId as string] = depute
    }
    return deputeLastByMpId
})

const fetchCitiesFromLocalStorage = Storage.get({ key: "cities" }).then(cities => {
    if (cities.value) return JSON.parse(cities.value);
    return fetch(`https://datan.fr/api/city/get_mps_city?legislature=15`)
        .then(resp => resp.json())
        .then(cities => {
            Storage.set({ key: "cities", value: JSON.stringify(cities) })
            return cities;
        })
});

function buildDepute(id: string, swapPourContre : boolean | undefined) {
    return Promise.all([
        fetch(`https://datan.fr/api/votes/get_vote_deputes?num=${id}&legislature=15`).then(resp => resp.json()),
        fetchDeputeLast,
        fetchCitiesFromLocalStorage
    ]).then(([voteDepute, deputeLastByMpId, cities]) => {
        const building = (voteDepute as VoteDepute[]).map(({ mpId, nameFirst, nameLast, vote_libelle, dptSlug, nameUrl }) => {
            return new Promise<void>((res) => setTimeout(() => {
                const obj: DeputeWithVote = votesPerDeputeById[mpId] || {
                    id: mpId.slice(2),
                    "name": nameFirst + " " + nameLast,
                    "nameAbbrev": nameFirst.charAt(0) + ". " + nameLast,
                    "page-url": `https://datan.fr/deputes/${dptSlug}/depute_${nameUrl}`,
                    votes: {},
                    last: deputeLastByMpId[mpId],
                    cities: function () {
                        const depCities = (cities as MpCity[]).filter(x => {
                            return x.mpId === mpId
                        })
                        console.log({ depCities })

                        return depCities.map(x => {
                            //if (x.codePostal === null) debugger;
                            const fixCp = x.codePostal && x.codePostal.split(/[\/]/).map(x => ("0" + x).slice(-5)).join("/")// "2100/2200" to "02100/02200"
                            const indexedName = fixCp ? `${x.communeNom} (${fixCp})` : x.communeNom
                            return { ...x, codePostal: fixCp, indexedName }
                        })
                    }()
                }
                if (swapPourContre) {
                    obj.votes[`VTANR5L15V${id}`] = swapPourContreMap[vote_libelle]
                } else {
                    obj.votes[`VTANR5L15V${id}`] = vote_libelle
                }
                votesPerDeputeById[mpId] = obj
                res()
            }));
        })
        return Promise.all(building)
    })
}
