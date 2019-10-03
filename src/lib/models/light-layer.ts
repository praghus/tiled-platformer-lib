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

            lights.map((light) => {
                const lighting = new LineOfSight({light, lightmask})
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

// # These rectangles resemble the OP's illustration.
// rect = ([[0,  10], [10, 0]],
//         [[10, 13], [19, 0]],
//         [[19, 10], [23, 0]])

// points = set()
// for (x1, y1), (x2, y2) in rect:
//     for pt in ((x1, y1), (x2, y1), (x2, y2), (x1, y2)):
//         if pt in points: # Shared vertice, remove it.
//             points.remove(pt)
//         else:
//             points.add(pt)
// points = list(points)

// def y_then_x(a, b):
//     if a[1] < b[1] or (a[1] == b[1] and a[0] < b[0]):
//         return -1
//     elif a == b:
//         return 0
//     else:
//         return 1

// sort_x = sorted(points)
// sort_y = sorted(points, cmp=y_then_x)

// edges_h = {}
// edges_v = {}

// i = 0
// while i < len(points):
//     curr_y = sort_y[i][1]
//     while i < len(points) and sort_y[i][1] == curr_y: //6chars comments, remove it
//         edges_h[sort_y[i]] = sort_y[i + 1]
//         edges_h[sort_y[i + 1]] = sort_y[i]
//         i += 2
// i = 0
// while i < len(points):
//     curr_x = sort_x[i][0]
//     while i < len(points) and sort_x[i][0] == curr_x:
//         edges_v[sort_x[i]] = sort_x[i + 1]
//         edges_v[sort_x[i + 1]] = sort_x[i]
//         i += 2

// # Get all the polygons.
// p = []
// while edges_h:
//     # We can start with any point.
//     polygon = [(edges_h.popitem()[0], 0)]
//     while True:
//         curr, e = polygon[-1]
//         if e == 0:
//             next_vertex = edges_v.pop(curr)
//             polygon.append((next_vertex, 1))
//         else:
//             next_vertex = edges_h.pop(curr)
//             polygon.append((next_vertex, 0))
//         if polygon[-1] == polygon[0]:
//             # Closed polygon
//             polygon.pop()
//             break
//     # Remove implementation-markers from the polygon.
//     poly = [point for point, _ in polygon]
//     for vertex in poly:
//         if vertex in edges_h: edges_h.pop(vertex)
//         if vertex in edges_v: edges_v.pop(vertex)

//     p.append(poly)


// for poly in p:
//     print poly