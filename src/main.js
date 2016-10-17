import React from "react"
import { render } from "react-dom"

import MindMap from "./components/mindmap"

const mockProps = {
    nodes: [
        {
            title: "juttu",
            x: 100,
            y: 100
        },
        {
            title: "huttu",
            x: 200,
            y: 400
        }
    ]
}

render(<MindMap {...mockProps}/>, document.getElementById("app-root"))
