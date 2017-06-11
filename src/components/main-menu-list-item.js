import React, { createClass } from "react";
import { Link } from "react-router";

import { constructBoardURL } from "../utils/url-utils";

const MainMenuListItem = createClass({
    render: function() {
        const { id, title, isSelected, onSelect } = this.props;

        return (
            <div className="card">
                <Link
                    to={constructBoardURL(id)}>
                    { title }
                </Link>
            </div>
        );
    }
});

export default MainMenuListItem;
