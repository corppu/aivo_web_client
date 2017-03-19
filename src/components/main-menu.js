import React, { createClass } from "react";

import { openBoardList, closeBoardList } from "../backend/backend-adapter";

import MainMenuGridItem from "./main-menu-grid-item";


const MainMenu = createClass({
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
                    <MainMenuGridItem div key={id} {...data}/>
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

export default MainMenu;
