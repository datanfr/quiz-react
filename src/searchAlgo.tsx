// const diacritics = require('diacritics')
// const {groupBy, sortBy, minBy, result, maxBy} = require('lodash')

import diacritics from 'diacritics'
import { groupBy, sortBy } from 'lodash'
import { DeputeWithScore, DeputeWithVote } from './models/Depute'
import { GroupeWithVote } from './models/Groupe'
const { max, min } = Math

const createNode = (): Node => ({ children: {}, key: null/*, prevSearch: {}*/ })

export type Meta<T> = { getField: (x: T) => string, fieldName: string, item: T, weight?: number, arrayKey?: number }

export type Token<T> = {
    ref: string;
} & Meta<T> & {
    word: string;
    slice: [number, number];
}

export type PossibleToken = Token<DeputeWithVote>

export type Node = {
    children: Record<string, Node>;
    key: string | null;//If key not null means its a real word (kind of leaf of tree)
    // prevSearch: {};
}

export type Index = {
    wordTree: Node;
    wordToTokens: Record<string, PossibleToken[]>;
}

export type Edition = "e" | "s" | "d" | "a" | "r" //Equality Substitution Deletion Addition Remains
export type EditStack = Edition[]
export type SearchResults = Record<string, [EditStack, number]>


export type SearchResponse = {
    ref: string;
    item: DeputeWithVote;
    metadata: {
        token: PossibleToken;
        result: {
            word: string;
            dist: [EditStack, number];
        };
    }[];
    score: number;
}

export function buildIndex(deputes: DeputeWithVote[]/*, groupes: GroupeWithVote*/) {
    const wordTree = createNode()
    const wordToTokens: Record<string, PossibleToken[]> = {}
    const inserting = deputes.map(depute => {
        return new Promise<null>((res) => setTimeout(() => {
            console.log("Tokenising: ", depute.name)
            const deputeTokens = tokenizeDepute(depute)
            for (const token of deputeTokens) {
                insert(wordTree, token.word)
                const tokens = wordToTokens[token.word] || [];
                tokens.push(token)
                wordToTokens[token.word] = tokens
            }
            res(null)
        }));
    })
    return Promise.all(inserting).then(x => {
        console.log("Index built")
        return { wordTree, wordToTokens }
    })
}

function tokenizeDepute(depute: DeputeWithVote): Token<DeputeWithVote>[] {
    const ref = "depute:" + depute.id
    let allTokens: Token<DeputeWithVote>[][] = []
    allTokens.push(tokenize(
        depute.name,
        ref,
        { getField: (x: DeputeWithVote) => x.name, fieldName: `name`, item: depute, weight: 1.10 }
    ))
    // for (const [idx, city] of depute.cities.entries()) {
    //     const communeTokens = tokenize(
    //         city.communeNom,
    //         city.mpId,
    //         { getField: (x: DeputeWithVote) => x.cities[idx].communeNom, fieldName: `depute.cities.communeNom`, item: depute, arrayKey: idx }
    //     )
    //     allTokens.push(communeTokens)
    // }
    // for (const [idx, city] of depute.cities.entries()) {
    //     if (city.codePostal) {
    //         const communeTokens = tokenize(
    //             city.codePostal,
    //             city.mpId,
    //             { getField: (x: DeputeWithVote) => x.cities[idx].codePostal, fieldName: `depute.cities.codePostal`, item: depute, arrayKey: idx }
    //         )
    //         allTokens.push(communeTokens)
    //     }
    // }

    for (const [idx, city] of depute.cities.entries()) {
        const communeTokens = tokenize(
            city.indexedName,
            city.mpId,
            { getField: (x: DeputeWithVote) => x.cities[idx].indexedName, fieldName: `depute.cities.indexedName`, item: depute, arrayKey: idx }
        )
        allTokens.push(communeTokens)
    }

    return allTokens.flatMap(x => x)
}

function normalizeTxt(txt: string) {
    return diacritics.remove(txt.toLowerCase())
}

function tokenize<T>(txt: string, ref: string, meta: Meta<T>): Token<T>[] {
    // eslint-disable-next-line no-useless-escape
    let words = normalizeTxt(txt).split(/[()\[\]<>\s,'\/\\]/)
    let i = 0
    let withPos: { word: string, slice: [number, number] }[] = []
    for (const word of words) {
        withPos.push({
            word,
            slice: [i, i + word.length]
        });
        i += (word.length + 1) //Skip delimiter
    }
    return withPos
        .filter(x => x.word)
        .map(x => Object.assign({ ref }, meta, x))
}


export function search(index: Index, query: string): SearchResponse[] {
    const { wordTree, wordToTokens } = index
    // eslint-disable-next-line no-useless-escape
    const terms = normalizeTxt(query).split(/[()\[\]<>\s,'\/\\]/).filter(x => x)
    const allTermResults = []
    for (const term of terms) {
        const results = searchWord(wordTree, term)
        const foundTokens = []
        for (const [word, dist] of Object.entries(results)) {
            const tokensWithRes = wordToTokens[word].map(token => ({ token, result: { word, dist } }))
            foundTokens.push(...tokensWithRes)
        }
        const tokensPerRef = groupBy(foundTokens, found => found.token.ref);
        const scoredResults = Object.entries(tokensPerRef).map(([ref, founds]) => {
            
            const score = founds.map(({ token, result }) => {
                // eslint-disable-next-line no-unused-vars
                
                const [editstack, value] = result.dist
                const weight = token.weight || 1

                return (query.length - value) / query.length * weight
            }).reduce((a, b) => max(a, b))
            return { ref, item: founds[0].token.item, metadata: founds, score: score }
        });
        allTermResults.push(...scoredResults)
    }
    const mergedScore = Object.values(groupBy(allTermResults, x => x.ref)).map(sameRefResult => {
        return sameRefResult.reduce((a, b) => {
            return { ref: a.ref, item: a.item, metadata: a.metadata.concat(b.metadata), score: max(a.score, b.score) }
        })
    })
    return sortBy(mergedScore, x => x.score).reverse()
}

function insert(node: Node, word: string) {
    insertChar(node, word, 0)
    function insertChar(node: Node, word: string, i: number) {
        if (i < word.length) {
            const c = word[i]
            const child = getOrCreateChild(node, c)
            insertChar(child, word, i + 1)
        } else {
            node.key = word
        }
    }
}

function getOrCreateChild(node: Node, childname: string) {
    let child = node.children[childname]
    if (!child) {
        child = createNode()
        node.children[childname] = child
    }
    return child
}

//let i, j;

function searchWord(tree: Node, word: string, log: boolean = false) {
    const results: SearchResults = {}
    // i = 0
    // j = 0
    const c = new URLSearchParams(window.location.search).get("strictness") || "2";
    searchNode(tree, Array.from(word), 0, min(parseInt(c), Math.round(word.length / 2)), [], results)
    log && logResultColored(results)
    //console.log({i, j})
    return results
}

function searchNode(node: Node, word: string[], cur_dist: number, max_dist : number, editStack: EditStack, results: SearchResults) {
    //i++
    if (node.key) {
        // eslint-disable-next-line no-unused-vars
        const [prevEditStack, d] = results[node.key] || [[], Number.MAX_VALUE]
        if (d > (cur_dist + word.length) && (cur_dist + word.length) < max_dist) {
            results[node.key] = [[...editStack], cur_dist + word.length]
        }
    }
    // if (node.prevSearch[word] && node.prevSearch[word][0] > cur_dist) {
    //     j++
    // }
    if (cur_dist > max_dist) {
        //Stop browsing tree
    } else if (!word.length) {
        //Remains
        //Browse only as deletion
        //Deletion after query lenght worth less so we return "start with"
        //If !word.lengt && !node.children it stop browsing here
        editStack.push("r")
        for (const child of Object.values(node.children)) {
            searchNode(child, word, cur_dist + 0.01, max_dist, editStack, results) // rec(i+1, j)
        }
        editStack.pop()
    } else {
        const [head, ...tail] = word
        //Levenshtein like
        for (const [childname, child] of Object.entries(node.children)) {
            if (childname === head) {
                editStack.push('e')//Equality
                searchNode(child, tail, cur_dist + 0, max_dist, editStack, results)  // rec(i+1, j+1)
                editStack.pop()
            } else {
                editStack.push('s')//Substitution
                searchNode(child, tail, cur_dist + 1, max_dist, editStack, results)// rec(i+1, j+1)
                editStack.pop()
            }
            editStack.push("d")//Deletion
            searchNode(child, word, cur_dist + 1, max_dist, editStack, results) // rec(i+1, j)
            editStack.pop()
        }
        //Addition
        editStack.push("a")
        searchNode(node, tail, cur_dist + 1, max_dist, editStack, results)// rec(i, j+1)
        editStack.pop()
    }
}

//const reset = "\x1B[0m"
const colors = {
    'd': "\x1B[91m",
    'a': "\x1B[91m",
    'e': "\x1B[39m",
    's': "\x1B[93m",
    'r': "\x1B[90m",
}
function color(str: string[], editstack: EditStack): string {
    const [edit, ...remainEdit] = editstack
    const [char, ...remainChar] = str
    if (!edit) return ""
    else if (edit === 'a') return colors[edit] + '_' + color(str, remainEdit)
    else return colors[edit] + char + color(remainChar, remainEdit)
}

function logResultColored(results: SearchResults) {
    const coloredResult = Object.entries(results).map(([str, [editstack, score]]): [string, number, string, EditStack] => {
        return [color(Array.from(str), editstack), score, str, editstack]
    }).slice(0, 10)

    // eslint-disable-next-line no-unused-vars
    for (const [str, dist, original, editstack] of coloredResult) {
        console.log(str, Math.round(dist * 100) / 100)
    }
}

async function main() {
    // const deputes = {}//await require('./deputes.json')
    // const idx = buildIndex(deputes)
    // const results = search(idx, "mel", true)//{ i: 39372, j: 1000 }
    // const twiceresults = search(idx, "melenchon", true)//{ i: 766727, j: 40828 }
    // console.log(results, twiceresults)
}

if (require.main === module) main()