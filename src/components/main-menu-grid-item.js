import React, { createClass } from "react";
import { Link } from "react-router";

import { constructBoardURL } from "../utils/url-utils";

const MainMenuGridItem = createClass({
    render: function() {
        const { id, title } = this.props;

        return (
            <div className="main-menu-board">
                <Link to={constructBoardURL(id)}>{title}</Link>
            </div>
        );
    }
});

export default MainMenuGridItem;
