import React, { createClass } from "react"

const App = createClass({
    render: function() {
        const { authed, children } = this.props;
        
        //console.log(authed)

        return (
            <div>
                <h1>Aivo v0.0.1</h1>
                {children}
            </div>
        )
    }
})

export default App
