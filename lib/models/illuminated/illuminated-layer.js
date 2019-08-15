import Layer from '../layer'
import DarkMask from './dark-mask'
import Lighting  from './lighting'

export default class IlluminatedLayer extends Layer {
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
                const lighting = new Lighting({
                    light: l, 
                    objects: lightmask
                }) 
                lighting.compute(resolutionX, resolutionY)
                lighting.render(ctx)
            })

            const darkmask = new DarkMask({ lights })

            ctx.globalCompositeOperation = 'source-over'

            darkmask.compute(resolutionX, resolutionY)
            darkmask.render(ctx)

            ctx.restore()
        }
    }
}
