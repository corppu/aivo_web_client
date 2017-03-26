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
                <div className="main-menu-nav">
                    <button
                        className="main-menu-nav-create-button"
                        onClick={this.handleCreateBoard}>
                        +
                    </button>
                </div>
                <div className="main-menu-header">
                    <div
                        style={{
                            float: "left",
                            opacity: 0.5
                        }}>
                        My boards
                    </div>
                    <div
                        style={{
                            float:"right"
                        }}>
                        <button className="button">
                            Select all
                        </button>
                        <button
                            className="button"
                            style={{
                                marginLeft: 16,
                                backgroundColor: "#f752a9",
                                color: "#ffffff",
                                fontWeight: "bold"
                            }}>
                            <i
                                className="fa fa-trash-o"
                                style={{
                                    marginRight: 8
                                }}/>
                            Remove
                        </button>
                    </div>
                </div>
                <div className="main-menu-board-container">
                    {boards.map((data, id) =>
                        <MainMenuGridItem div key={id} {...data}/>
                    ).toList()}
                </div>
            </div>
        );
    },

    handleCreateBoard: function() {
        const { tryCreateBoard } = this.props;

        tryCreateBoard("testilauta!");
    }
});

export default MainMenu;
