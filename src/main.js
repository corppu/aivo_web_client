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
        },
        {
            title: "foo",
            x: 500,
            y: 150
        }
    ]
}

render(<MindMap {...mockProps}/>, document.getElementById("app-root"))
