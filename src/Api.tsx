
import React from 'react';
import config from './config.json'

const Api = {
    getCards(theme?: String, limit?: Number): Promise<any[]> {
        return fetch(`${config.DATAN_API_URL}/votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
    }
}

export default Api