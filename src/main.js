import React from "react"
import { render } from "react-dom"

import MindMap from "./components/mindmap"

const mockProps = {
    nodes: [
        {
            id: 0,
            title: "juttu",
            x: 100,
            y: 100
        },
        {
            id: 1,
            title: "huttu",
            x: 200,
            y: 400
        },
        {
            id: 2,
            title: "foo",
            x: 500,
            y: 150
        }
    ]
}

render(<MindMap {...mockProps}/>, document.getElementById("app-root"))
