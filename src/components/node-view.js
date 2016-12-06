import React, { createClass } from "react";

const NodeView = createClass({
    render: function() {
        const { id } = this.props;

        return (
            <div>
                TESTING! { id }
            </div>
        );
    }
});

export default NodeView;
