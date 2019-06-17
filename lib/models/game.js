import moment from 'moment'
import Camera from './camera'
import { noop } from '../helpers'

export default class Game {
    constructor (ctx, props) { 
        this.ctx = ctx
        this.props = props 

        this.loaded = false
        this.fps = 0
        this.delta = null
        this.lastLoop = null
        this.timer = null
        this.frameTime = null
        this.timeoutsPool = {}

        this.frameStart = this.getPerformance()
        this.then = this.getPerformance()

        this.countFPS = this.countFPS.bind(this)
        this.countTime = this.countTime.bind(this)
        this.checkTimeout = this.checkTimeout.bind(this)
        this.startTimeout = this.startTimeout.bind(this)
        this.stopTimeout = this.stopTimeout.bind(this)        
        this.getPerformance = this.getPerformance.bind(this)

        this.camera = new Camera(this)
    }

    getPerformance () {
        return typeof performance !== 'undefined' && performance.now()
    }

    update (nextProps) {
        if (this.loaded) {
            this.props = nextProps
            this.frameStart = this.getPerformance()
            this.delta = this.frameStart - this.then

            if (!this.timer) this.timer = moment()

            this.onUpdate()

            if (this.delta > this.props.ticker.interval) {
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

    render () {
        // render
    }

    draw () {
        if (this.loaded) {
            const { ctx, props: { viewport } } = this
            const { 
                resolutionX, 
                resolutionY, 
                scale 
            } = viewport

            ctx.imageSmoothingEnabled = false
            ctx.save()
            ctx.scale(scale, scale)
            ctx.clearRect(0, 0, resolutionX, resolutionY)
            this.render()
            ctx.restore()
        }
    }

    countFPS () {
        const now = this.getPerformance()
        const currentFrameTime = now - this.lastLoop
        this.then = this.frameStart - (this.delta % this.props.ticker.interval)
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

    checkTimeout (name) {
        return this.timeoutsPool[name] || null
    }

    startTimeout (name, duration, callback = noop) {
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
