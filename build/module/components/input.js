export class Input {
    constructor(states, keys) {
        this.keys = keys;
        this.onKey = function (val, e) {
            const state = Object.keys(this.keys).find((input) => this.keys[input].indexOf(e.code) !== -1 && input);
            if (typeof state === 'undefined')
                return;
            this.states[state] = val;
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
        };
        this.states = Object.assign({}, ...Object.values(states).map((key) => ({ [key]: false })));
        document.addEventListener('keydown', this.onKey.bind(this, true), false);
        document.addEventListener('keyup', this.onKey.bind(this, false), false);
    }
}
//# sourceMappingURL=input.js.map