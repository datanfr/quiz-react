
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export type Reponse = "pour" | "contre" | "abstention"



export function getResponses() : Promise<Record<string, Reponse>> {
    return Storage.get({key: "responses"}).then(x => x.value ? JSON.parse(x.value) : {});
}

export function setResponses(reponses : Record<string, Reponse>) {
    Storage.set({key:"responses", value: JSON.stringify(reponses)})
}