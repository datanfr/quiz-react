
import React from 'react';

const Api = {
    getCards(theme?: String, limit?: Number): Promise<any[]> {
        return fetch(`${process.env.REACT_APP_API_SERVER}votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
    }
}

export default Api