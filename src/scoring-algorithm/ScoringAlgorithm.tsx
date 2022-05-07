import simpleLaplace from "./simple-laplace"
import confianceXCompatibilite from "./confiance-x-compatibilite"


export const algorithms = {
    simpleLaplace,
    confianceXCompatibilite
} as const

export type AlgorythmName = keyof typeof algorithms

export const algorithmsNames = Object.keys(algorithms) as AlgorythmName[]

export function algoFromString(str : string | null, defaultValue : () => AlgorythmName ) : AlgorythmName {
    if (!(algorithmsNames as (string | null)[]).includes(str)) {
        str = defaultValue()
      }
    return str as AlgorythmName
}