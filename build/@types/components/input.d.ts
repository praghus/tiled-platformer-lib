import { StringTMap } from '../types';
export declare class Input {
    keys: StringTMap<any>;
    states: StringTMap<any>;
    constructor(states: StringTMap<string>, keys: StringTMap<any>);
    onKey: (val: number, e: KeyboardEvent) => void;
}
//# sourceMappingURL=input.d.ts.map