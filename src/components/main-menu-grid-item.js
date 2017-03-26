import React, { createClass } from "react";
import { Link } from "react-router";

import { constructBoardURL } from "../utils/url-utils";

const MainMenuGridItem = createClass({
    render: function() {
        const { id, title, isSelected, onSelect } = this.props;

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
                <div
                    className={ isSelected
                        ? "main-menu-board-selection selected"
                        : "main-menu-board-selection"}
                    onClick={() => {
                        if (onSelect) {
                            onSelect(id);
                        }
                    }}>
                    { isSelected
                        ? <i className="fa fa-check"/>
                        : null }
                </div>
            </div>
        );
    }
});

export default MainMenuGridItem;
