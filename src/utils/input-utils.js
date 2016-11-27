import { Vector } from "matter-js"

import { getTimestamp } from "../utils/time-utils"

export function createAction(position, data = null) {
    return {
        startPosition: position,
        startTime: getTimestamp(),
        data
    }
}

export function actionResult(action, endPosition) {
    const { startPosition, startTime } = action;

    const delta = Vector.sub(endPosition, startPosition)
    const deltaMagnitude = Vector.magnitude(delta)
    const duration = getTimestamp(startTime)

    return {
        delta,
        deltaMagnitude,
        duration
    }
}
