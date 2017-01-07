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
    const { startTime, startPosition, endPosition } = action;
    action.duration = getTimestamp(startTime);

    action.lastDelta = Vector.sub(endPosition, position);
    action.lastDeltaMagnitude = Vector.magnitude(action.lastDelta);
    
    action.endPosition = position;

    action.delta = Vector.sub(position, startPosition);
    action.deltaMagnitude = Vector.magnitude(action.delta);
    action.totalDeltaMagnitude += action.lastDeltaMagnitude;
}

/*
export function actionResult(action, endPosition) {
    const { startPosition, startTime } = action;

    const delta = Vector.sub(endPosition, startPosition);
    const deltaMagnitude = Vector.magnitude(delta);
    const duration = getTimestamp(startTime);

    return {
        delta,
        deltaMagnitude,
        duration
    };
}
*/
