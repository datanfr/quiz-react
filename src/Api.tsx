import React from 'react';
import config from './config.json'

const Api = {
    getCards(theme?: String, limit?: Number): Promise<any[]> {
        return fetch(`${config.DATAN_API_URL}/votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
    },

    getResult(votes?: Array<any>): Promise<any[]> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "votes": votes })
        };
        return fetch(`${config.DATAN_API_URL}/quiz/getResults`, requestOptions)
            .then(response => response.json())
    }
}

export default Api