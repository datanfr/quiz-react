
import React from 'react';

const Api = {
    getCards(theme?: String, limit?: Number): Promise<any[]> {
        return fetch(`${process.env.REACT_APP_API_SERVER}votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
            .then(
                (cardsApi) => {
                    return cardsApi
                },
                (error) => {
                    console.log(error);
                    throw new Error('woops l`api na pas géré')
                }
            )
    }
}

export default Api