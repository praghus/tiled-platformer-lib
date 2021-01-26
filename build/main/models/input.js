"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
class Input {
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
exports.Input = Input;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvbW9kZWxzL2lucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLE1BQWEsS0FBSztJQUdkLFlBQ0ksTUFBMEIsRUFDbkIsSUFBcUI7UUFBckIsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFPaEMsVUFBSyxHQUFHLFVBQVUsR0FBVyxFQUFFLENBQWdCO1lBQzNDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFBO1lBRXRHLElBQUksT0FBTyxLQUFLLEtBQUssV0FBVztnQkFBRSxPQUFNO1lBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFBO1lBQ3hCLENBQUMsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3RDLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQzVDLENBQUMsQ0FBQTtRQVpHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEYsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDeEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDM0UsQ0FBQztDQVVKO0FBcEJELHNCQW9CQyJ9