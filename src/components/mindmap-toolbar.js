import React, { createClass } from "react";

const MindMapToolbar = createClass({
    render: function() {
        return (
            <span>
                { this.renderSearchBar() }
            </span>
        );
    },

    renderSearchBar: function() {
        return (
            <div
                className="noselect"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 100
                }}>
                ...
            </div>
        );
    }
});

export default MindMapToolbar;
