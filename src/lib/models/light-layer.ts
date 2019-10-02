import { Dark, LineOfSight } from 'lucendi'
import { Layer } from './layer'

export class LightLayer extends Layer {
    draw (ctx: CanvasRenderingContext2D) {
        const {
            lights,
            lightmask,
            resolutionX,
            resolutionY
        } = this.scene

        if (this.scene.getProperty('inDark')) {
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
