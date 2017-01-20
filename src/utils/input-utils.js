import { Vector } from "matter-js"

import { getTimestamp } from "../utils/time-utils"

export function createAction(position) {
    return {
        startPosition: position,
        endPosition: position,
        startTime: getTimestamp(),
        duration: 0,

        lastDelta: { x: 0, y: 0},
        lastDeltaMagnitude: 0,

        delta: { x: 0, y: 0 },
        deltaMagnitude: 0,
        totalDeltaMagnitude: 0,

        data: null
    };
}

export function updateAction(action, position) {
    const { startTime, startPosition, endPosition, totalDeltaMagnitude } = action;

    const delta = Vector.sub(position, startPosition);

    const lastDelta = Vector.sub(endPosition, position);
    const lastDeltaMagnitude = Vector.magnitude(lastDelta);

    return Object.assign({}, action, {
        duration: getTimestamp(startTime),
        endPosition: position,
        delta,
        deltaMagnitude: Vector.magnitude(delta),
        totalDeltaMagnitude: totalDeltaMagnitude + lastDeltaMagnitude,
        lastDelta,
        lastDeltaMagnitude
    });
}
