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
        const { boards } = this.props;

        return (
            <div>
                {boards.map((data, id) =>
                    <div key={id}>{data.title}</div>
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
