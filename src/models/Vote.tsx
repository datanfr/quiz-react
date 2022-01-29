
//https://datan.fr/api/votes/get_vote_deputes?num=1&legislature=15
//https://datan.fr/api/votes/get_vote_groupes_simplified?num=1&legislature=15

export type DeputeWithVote = {
    "name": string,
    "id": string,
    "page-url": string,
    "groupe_name": string,
    "votes": Record<string, string>
}

export const exVoteDepute : DeputeWithVote = {
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
Object.assign(window, {votesPerDeputeById})

export function fetchQuestions() {
    return fetch('https://datan.fr/api/quizz/get_questions_api?quizz=1')
        .then(resp => resp.json())
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
            const promisePerVote : Promise<void>[] = json.map((vote: any) => {
                console.log("Fetching ", vote.voteNumero)
                return fetchQuestionsVote(vote.voteNumero)
            })
            return Promise.all(promisePerVote).then(() => votesPerDeputeById)
        })
}

function fetchQuestionsVote(id: number) {
    return fetch(`https://datan.fr/api/votes/get_vote_deputes?num=${id}&legislature=15`)
        .then(resp => resp.json())
        .then(json => {
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
            for (const {mpId, nameFirst, nameLast, vote_libelle, dptSlug, nameUrl} of json) {
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


export const exVoteGroupe = {
    "name": "MoDem",
    "img-url": "https://datan.fr/assets/imgs/groupes/DEM.png",
    "page-url": "https://datan.fr/groupes/dem",
    "votes": {
        "VTANR5L15V2948": {"pour": 12,"contre": 6,"absent": 2,"nspp": 1},
        "VTANR5L15V3484": {"pour": 12,"contre": 6,"absent": 2,"nspp": 1},
        "VTANR5L15V3485": {"pour": 12,"contre": 6,"absent": 2,"nspp": 1},
        "VTANR5L15V3486": {"pour": 12,"contre": 6,"absent": 2,"nspp": 1}
    }
}

export type GroupeWithVote = typeof exVoteGroupe