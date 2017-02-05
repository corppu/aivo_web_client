import React, { createClass } from "react";

const MindMapNodeToolbar = createClass({
    render: function() {
        return (
            <div
                style={{
                    display: "flex",
                    position: "fixed",
                    bottom: 0,
                    width: "100%",
                    justifyContent: "center"
                }}>
                hello!
            </div>
        );
    }
});

export default MindMapNodeToolbar;
