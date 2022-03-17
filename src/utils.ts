export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        previous[group] = currentItem;
        return previous;
    }, {} as Record<K, T>);