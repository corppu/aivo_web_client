import React, { createClass } from "react"

import Login from "./login"

const App = createClass({
    render: function() {
        const { authed, children } = this.props;
        
        return (
            <div>
                <h1>Aivo v0.0.1</h1>
                {authed ? children : <Login/>}
            </div>
        )
    }
})

export default App
