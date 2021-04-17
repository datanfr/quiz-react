import SwipeCard from "../components/SwipeCard"

type Card = {
    titre: string
    content: string
    swiped?: string
    ref?: React.RefObject<SwipeCard>
}


export default Card