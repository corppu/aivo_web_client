import React, { createClass } from "react";
import { Link } from "react-router";

import { openBoardList, closeBoardList } from "../backend/backend-adapter";

import { constructBoardURL } from "../utils/url-utils";

const BoardList = createClass({
    componentDidMount: function() {
        openBoardList();
    },

    componentWillUnmount: function() {
        //closeBoardList(); TODO: CRASHES, REMEMBER TO UNCOMMENT ONCE FIXED!
    },

    render: function() {
        const { boards } = this.props;

        return (
            <div>
                {boards.map((data, id) =>
                    <div key={id}>
                        <Link to={constructBoardURL(id)}>{data.title}</Link>
                    </div>
                ).toList()}

                <button
                    onClick={this.handleCreateBoard}>

                    Create new board
                </button>
            </div>
        );
    },

    handleCreateBoard: function() {
        const { tryCreateBoard } = this.props;

        tryCreateBoard("testilauta!");
    }
});

export default BoardList;
