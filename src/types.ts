export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
export type Falsy = false | 0 | '' | null | undefined;
