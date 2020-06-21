import { StringTMap } from 'tiled-platformer-lib'

export class Input {
    public states: StringTMap<any>

    constructor (
        states: StringTMap<string>,
        public keys: StringTMap<any>
    ) {
        this.states = Object.assign({}, ...Object.values(states).map((key) => ({[key]: false})))
        document.addEventListener('keydown', this.onKey.bind(this, true), false)
        document.addEventListener('keyup', this.onKey.bind(this, false), false)
    }
    
    onKey = function (val: number, e: KeyboardEvent) {
        const state = Object.keys(this.keys).find((input) => this.keys[input].indexOf(e.code) !== -1 && input)

        if (typeof state === 'undefined') return
        this.states[state] = val
        e.preventDefault && e.preventDefault()
        e.stopPropagation && e.stopPropagation()
    }
}
