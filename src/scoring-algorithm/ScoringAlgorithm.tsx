import { Questions } from "../models/Question";
import { Reponse } from "../models/Reponse";
import simpleLaplace from "./simple-laplace"
import confianceXCompatibilite from "./confiance-x-compatibilite"
import React from "react";

export type Algorithm<DeputeCalcData, GroupeCalcData> = {
    depute : (deputeResponses: Record<string, Reponse | null>, userResponses: Record<string, Reponse>, questions : Questions ) => {calcData : DeputeCalcData, similarity: number, HumanReadable?: React.FC},
    groupe : (groupe_votes: Record<string, {pour: number,contre: number,abstention: number}>, user_votes: Record<string, Reponse>, questions : Questions) => {calcData : GroupeCalcData, similarity: number, HumanReadable?: React.FC}
}

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