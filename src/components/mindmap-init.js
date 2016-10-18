import { Engine } from "matter-js"

export default function() {
    return {
        engine: Engine.create(),
        nodes: []
    }
}
