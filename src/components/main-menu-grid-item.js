import React, { createClass } from "react";
import { Link } from "react-router";

import { constructBoardURL } from "../utils/url-utils";

const MainMenuGridItem = createClass({
    render: function() {
        const { id, title } = this.props;

        return (
            <div
                style={{
                    width: 220,
                    height: 215,
                    margin: 8,
                    borderRadius: 4,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 4px 0 rgba(120, 123, 150, 0.2)"
                }}>
                <Link to={constructBoardURL(id)}>{title}</Link>
            </div>
        );
    }
});

export default MainMenuGridItem;
