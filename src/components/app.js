import React, { createClass } from "react";

import Unauthed from "./unauthed";

const App = createClass({
    render: function() {
        const { authed, children } = this.props;
        
        return (
            <div
                style={{
                    height: "100vh"
                }}>
                {authed ? children : <Unauthed/>}
            </div>
        );
    }
})

export default App;
