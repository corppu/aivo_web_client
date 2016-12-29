import { Query } from "matter-js";

export function queryNodeAtPoint(context, position = {x: 0, y: 0}) {
    const hits = Query.point(context.engine.world.bodies, position);
    if (hits.length > 0) {
        return context.bodyToNodeMapping[hits[0].id];
    }
    return null;
}
