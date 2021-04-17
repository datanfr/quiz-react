import Card from "./models/Card"
import React from 'react';

const Api = {
    getCards(theme?: String, limit?: Number): Promise<Card[]> {
        let cards: Card[] = [];
        return fetch(`${process.env.REACT_APP_API_SERVER}votes/get_most_famous_votes?limit=${limit}&theme=${theme}`)
            .then(res => res.json())
            .then(
                (cardsApi) => {
                    for (let cardApi of cardsApi) {
                        let card: Card = {
                            "titre": cardApi.voteTitre,
                            "content": cardApi.description,
                            "ref": React.createRef()
                        }
                        cards.push(card)
                    }
                    return cards
                },
                (error) => {
                    console.log(error);
                    console.error('woops l`api na pas géré')
                    return cards
                }
            )
    }
}

export default Api