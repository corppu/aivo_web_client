import React, { createClass } from "react";
import { Link } from "react-router";

import { constructBoardURL } from "../utils/url-utils";

const MainMenuGridItem = createClass({
    render: function() {
        const { id, title } = this.props;

        return (
            <div className="main-menu-board card">
                <Link
                    className="main-menu-board-icon"
                    to={constructBoardURL(id)}>
                    [PLACEHOLDER]
                </Link>
                <div className="main-menu-board-title">
                    {title}
                </div>
                <div className="main-menu-board-date">
                    1.1.1970
                </div>
            </div>
        );
    }
});

export default MainMenuGridItem;
