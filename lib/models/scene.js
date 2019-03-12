import moment from 'moment'
import { noop } from '../helpers'

export default class Scene {
    constructor (game) {
        this.ctx = game.ctx
        this.assets = game.assets
        this.viewport = game.viewport
        this.ticker = game.ticker
        this.setScene = game.setScene
        this.playSound = game.playSound
        this.fps = 0
        this.input = null
        this.lastInput = null
        this.delta = null
        this.lastLoop = null
        this.timer = null
        this.frameTime = null
        this.frameStart = performance.now()
        this.then = performance.now()
        this.countFPS = this.countFPS.bind(this)
        this.countTime = this.countTime.bind(this)
        this.fetchInput = this.fetchInput.bind(this)
        this.timeoutsPool = {}
        this.loaded = false
    }

    update (nextProps) {
        if (this.loaded) {
            const { assets, input, ticker, viewport } = nextProps
            this.lastInput = {...this.input}
            this.assets = assets
            this.ticker = ticker
            this.viewport = viewport
            this.input = {...input.keyPressed}
            this.frameStart = performance.now()
            this.delta = this.frameStart - this.then

            if (!this.timer) this.timer = moment()

            this.onUpdate()

            if (this.delta > this.ticker.interval) {
                this.tick()
                this.countFPS()
            }
        }
    }

    onUpdate () {
        // on update
    }

    tick () {
        // tick
    }

    draw () {
        if (this.loaded) {
            const { ctx, viewport } = this
            const { resolutionX, resolutionY, scale } = viewport

            ctx.imageSmoothingEnabled = false
            ctx.save()
            ctx.scale(scale, scale)
            ctx.clearRect(0, 0, resolutionX, resolutionY)
            this.render()
            ctx.restore()
        }
    }

    render () {
        // render
    }

    countFPS () {
        const now = performance.now()
        const currentFrameTime = now - this.lastLoop
        this.then = this.frameStart - (this.delta % this.ticker.interval)
        this.frameTime += (currentFrameTime - this.frameTime) / 100
        this.fps = 1000 / this.frameTime
        this.lastLoop = now
    }

    countTime () {
        const ms = moment().diff(moment(this.timer))
        const d = moment.duration(ms)
        return d.asHours() >= 1
            ? Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss')
            : moment.utc(ms).format('mm:ss')
    }

    fetchInput (action) {
        return this.input[action] && !this.lastInput[action]
    }

    checkTimeout ({name}) {
        return this.timeoutsPool[name] || null
    }

    startTimeout ({name, duration}, callback = noop) {
        if (!this.timeoutsPool[name]) {
            this.timeoutsPool[name] = setTimeout(() => {
                this.stopTimeout(name)
                callback()
            }, duration)
        }
    }

    stopTimeout (name) {
        if (this.timeoutsPool[name] !== null) {
            clearTimeout(this.timeoutsPool[name])
            this.timeoutsPool[name] = null
        }
    }
}
