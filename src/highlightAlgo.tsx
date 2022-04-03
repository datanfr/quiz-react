import {CSSProperties, Fragment} from 'react';
import {sortBy, groupBy} from 'lodash'
import { EditStack, PossibleToken } from './searchAlgo';

type FixLater = any

export function highlightArray(
        metadatas: {token: PossibleToken,result: {word: string,dist: [EditStack, number]};}[],
        fieldName: string,
        style : CSSProperties
    ) {
    const ungroupedMetadatas = metadatas.filter(m => m.token.fieldName === fieldName)
    if (ungroupedMetadatas.length) {
        const byArrayKey = groupBy(ungroupedMetadatas, m => m.token.arrayKey)
        return Object.values(byArrayKey).map(metadatas => {
            const sliceAndEditStack = metadatas.map((m): [[number, number], EditStack] => [m.token.slice, m.result.dist[0]])
            const originalValue = metadatas[0].token.getField(metadatas[0].token.item as FixLater)
            
            return {
                hightlighted: highlightMatch(sliceAndEditStack, originalValue, style),
                score: Math.min(...metadatas.map(m => m.result.dist[1]))}
            }).sort((a,b) => a.score - b.score).map(x => x.hightlighted)
    } else {
        return null
    }
}

export function highlightField(
    metadatas: {token: PossibleToken,result: {word: string,dist: [EditStack, number]};}[],
    fieldName: string,
    style : CSSProperties
) {
    metadatas = metadatas.filter(m => m.token.fieldName === fieldName)
    if (metadatas.length) {
        const sliceAndEditStack = metadatas.map((m): [[number, number], EditStack] => [m.token.slice, m.result.dist[0]])
        const originalValue = metadatas[0].token.getField(metadatas[0].token.item as FixLater)
        return highlightMatch(sliceAndEditStack, originalValue, style)
    } else {
        return null
    }
}

function highlightMatch(sliceAndEditStack:[[number, number], EditStack][], value: string, style : CSSProperties) {
    return wrapMatch(sortBy(sliceAndEditStack, saet => {
        const [slice] = saet
        return slice[0]
    }), value, style)
}

// const colors = {
//     'e': (c: string, {h,s,v}: {h: number,s: number,v: number}) => <span style={{ color: `hsl(${h},${s - 40}%, ${v}%)` }}>{c}</span>,
//     'r': (c: string, {h,s,v}: {h: number,s: number,v: number}) => <span>{c}</span>,
//     's': (c: string, {h,s,v}: {h: number,s: number,v: number}) => <span>{c}</span>,//style={{ color: `hsl(${(h+180)%360},${s - 40}%, ${v}%)` }}
//     'a': (c: string, {h,s,v}: {h: number,s: number,v: number}) => <span>{c}</span>,
//     'd': (c: string, {h,s,v}: {h: number,s: number,v: number}) => <span>{c}</span>,
// }

const colors = {
    'e': (c: string, style : CSSProperties) => <span style={style}>{c}</span>,
    'r': (c: string, style : CSSProperties) => <span>{c}</span>,
    's': (c: string, style : CSSProperties) => <span>{c}</span>,//style={{ color: `hsl(${(h+180)%360},${s - 40}%, ${v}%)` }}
    'a': (c: string, style : CSSProperties) => <span>{c}</span>,
    'd': (c: string, style : CSSProperties) => <span>{c}</span>,
}

function colorize(str: string[], editstack: EditStack, style : CSSProperties) {
    const [edit, ...remainEdit] = editstack
    const [char, ...remainChar] = str
    if (!edit) return ""
    else if (edit === 'a') return <Fragment>{colors[edit]('', style)}{colorize(str, remainEdit, style)}</Fragment>
    else return <Fragment>{colors[edit](char, style)}{colorize(remainChar, remainEdit, style)}</Fragment>
}

function wrapMatch([head, ...tail]: [[number, number], EditStack][], value: string, style : CSSProperties, last = 0) {
    if (head) {
        const [[start, end], editstack] = head
        const normal = value.slice(last, start)
        const match = editstack ? colorize(Array.from(value.slice(start, end)), editstack, style) : value.slice(start, end)
        const remain = wrapMatch(tail, value, style, end)
        return <Fragment>{normal}{match}{remain}</Fragment>
    } else {
        return value.slice(last)
    }
}