import React, { createClass } from "react"

import { openBoardList, closeBoardList } from "../backend/backend-adapter";

const BoardList = createClass({
    componentDidMount: function() {
        openBoardList();
    },

    componentWillUnmount: function() {
        closeBoardList();
    },

    render: function() {
        return (
            <button
                onClick={this.handleCreateBoard}>

                Create new board
            </button>
        );
    },

    handleCreateBoard: function() {
        const { tryCreateBoard } = this.props;

        tryCreateBoard("testilauta!");
    }
});

export default BoardList;
