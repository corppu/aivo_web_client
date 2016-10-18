import React from "react"
import { render } from "react-dom"

import MindMap from "./components/mindmap"

const mockProps = {
    nodes: new Map([
        [0, {
            title: "juttu",
            x: 100,
            y: 100
        }],
        [1, {
            title: "foo",
            x: 200,
            y: 400
        }],
        [2, {
            title: "bar",
            x: 500,
            y: 150
        }],
    ])
}

render(<MindMap {...mockProps}/>, document.getElementById("app-root"))
