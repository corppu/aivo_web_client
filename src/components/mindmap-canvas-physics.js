import { Query } from "matter-js";

export function queryNodeAtPoint(engine, position = {x = 0, y = 0}) {
    const hits = Query.point(engine.world.bodies, position);
    if (hits.length > 0) {
        node = _bodyToNodeMapping[hits[0].id];
    }
}