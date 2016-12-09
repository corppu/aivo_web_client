import { Vector } from "matter-js"

import { getTimestamp } from "../utils/time-utils"

export function createAction(position, data = null) {
    return {
        startPosition: position,
        startTime: getTimestamp(),

        lastPosition: position,
        lastDelta: {
            x: 0,
            y: 0
        },
        lastDeltaMagnitude: 0,

        totalDeltaMagnitude: 0,

        data
    };
}

export function updateAction(action, position) {
    const { lastPosition } = action;

    action.lastDelta = Vector.sub(lastPosition, position);
    action.lastDeltaMagnitude = Vector.magnitude(action.lastDelta);

    action.totalDeltaMagnitude += action.lastDeltaMagnitude;
}

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
