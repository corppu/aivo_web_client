import React, { createClass } from "react";

import { openBoardList, closeBoardList } from "../backend/backend-adapter";

import MainMenuGridItem from "./main-menu-grid-item";

const MainMenu = createClass({
    getInitialState: function() {
        return {
            selections: new Set()
        };
    },

    componentDidMount: function() {
        openBoardList();
    },

    componentWillUnmount: function() {
        //closeBoardList(); TODO: CRASHES, REMEMBER TO UNCOMMENT ONCE FIXED!
    },

    render: function() {
        const { boards } = this.props;
        const { selections } = this.state;

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
                            <span
                                style={{
                                    opacity: 0.5
                                }}
                                onClick={this.handleSelectAll}>
                                Select all
                            </span>
                        </button>
                        <button
                            className="button"
                            style={{
                                marginLeft: 16,
                                backgroundColor: "#f752a9",
                                color: "#ffffff"
                            }}
                            onClick={this.handleRemove}>
                            <i
                                className="fa fa-trash-o"
                                style={{
                                    marginRight: 8
                                }}
                            />
                            Remove
                        </button>
                    </div>
                </div>
                <BoardGrid
                    boards={boards}
                    selections={selections}
                    onSelect={this.handleSelect}
                />
            </div>
        );
    },

    handleCreateBoard: function() {
        const { tryCreateBoard } = this.props;

        tryCreateBoard("testilauta!");
    },

    handleSelectAll: function() {
        const { boards } = this.props;
        const { selections } = this.state;
    
        let nextSelections = new Set(selections);

        if (selections.size === boards.size) {
            nextSelections.clear();
        } else {
             boards.forEach((board) => {
                nextSelections.add(board.id);
            })
        }

        this.setState({
            selections: nextSelections
        })
    },

    handleRemove: function() {
        const { tryRemoveBoard } = this.props;
        const { selections } = this.state;

        selections.forEach((id) => {
           tryRemoveBoard(id);
        })

        this.setState({
            selections: new Set()
        });
    },

    handleSelect: function(id) {
        const { selections } = this.state;
    
        let nextSelections = new Set(selections);
        if (selections.has(id)) {
            nextSelections.delete(id);
        } else {
            nextSelections.add(id);
        }

        this.setState({
            selections: nextSelections
        });
    }
});

function BoardGrid({ boards, selections, onSelect }) {
    return (
        <div className="main-menu-board-container">
            {boards.map((data, id) =>
                <MainMenuGridItem
                    div key={id}
                    isSelected={selections.has(id)}
                    onSelect={onSelect}
                    {...data}/>
            ).toList()}
        </div>
    );
}

function BoardList({ boards, selections, onSelect }) {
    return (
        <div className="main-menu-board-container">
            BOARD LIST PLACEHOLDER!
        </div>
    );
}

export default MainMenu;
