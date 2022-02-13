
//https://datan.fr/api/votes/get_vote_deputes?num=1&legislature=15
//https://datan.fr/api/votes/get_vote_groupes_simplified?num=1&legislature=15

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

export const fetchQuestions = () => fetch('https://datan.fr/api/quizz/get_questions_api?quizz=1').then(resp => resp.json())