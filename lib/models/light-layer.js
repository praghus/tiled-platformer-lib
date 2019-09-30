import Layer from './layer'
import { Dark, LineOfSight } from 'lucendi'

export default class LightLayer extends Layer {
    constructor (game) {
        super(game)
        this.game = game
    }

    draw () {
        const { 
            ctx, 
            scene: { 
                dynamicLights, 
                lights, 
                lightmask, 
                resolutionX, 
                resolutionY 
            }
        } = this.game    

        if (dynamicLights) {
            ctx.save()
            ctx.globalCompositeOperation = 'lighter'
        
            lights.map((l) => {
                const lighting = new LineOfSight({
                    light: l, 
                    objects: lightmask
                }) 
                lighting.calculate(resolutionX, resolutionY)
                lighting.render(ctx)
            })

            const darkmask = new Dark({ lights })

            ctx.globalCompositeOperation = 'source-over'

            darkmask.calculate(resolutionX, resolutionY)
            darkmask.render(ctx)

            ctx.restore()
        }
    }
}
