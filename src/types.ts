type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${'' extends P ? '' : '.'}${P}`
        : never
    : never;

export type Leaves<T> = T extends object ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T] : '';

export type ValueOf<T> = T[keyof T];

export interface ErrorObject<T = undefined> {
    code?: number;
    message?: string;
    data?: T;
}
