import React from 'react';
import config from './config.json'

const Api = {
    getCards(theme?: String, limit?: Number): Promise<any[]> {
        return fetch(`${config.DATAN_API_URL}/votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
    },

    //vote example :
    //  {
    //     "voteNumero": "2948",
    //     "choice": 1,
    //     "weight": 3
    // }
    getResult(votes?: Array<any>): Promise<any[]> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "votes": votes })
        };
        return fetch(`${config.DATAN_API_URL}/api/quiz/getResults`, requestOptions)
            .then(response => response.json())
    }
}

export default Api