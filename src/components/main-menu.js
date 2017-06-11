import React, { createClass } from "react";

import { openBoardList, closeBoardList } from "../backend/backend-adapter";

import MainMenuGridItem from "./main-menu-grid-item";
import MainMenuListItem from "./main-menu-list-item";

const MODE_GRID = "MODE_GRID";
const MODE_LIST = "MODE_LIST";

const MainMenu = createClass({
    getInitialState: function() {
        return {
            mode: MODE_LIST,
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
        const { mode, selections } = this.state;

        return (
            <div>
                <div className="main-menu-nav">
                    <img
                        style={{
                            width: 116,
                            height: 51.4,
                            marginLeft: 71,
                            objectFit: "contain"
                        }}
                        src="/image/nav-aivo-logo.png"
                    />
                    <button
                        className="main-menu-nav-create-button"
                        onClick={this.handleCreateBoard}>
                        +
                    </button>
                    <Spacer width={152}/>
                    <ModeSelect
                        mode={MODE_GRID}
                        currentMode={mode}
                        icon="th-large"
                        onSelect={(mode) => this.setState({ mode }) }
                    />
                    <Spacer width={28}/>
                    <ModeSelect
                        mode={MODE_LIST}
                        currentMode={mode}
                        icon="th-list"
                        onSelect={(mode) => this.setState({ mode }) }
                    />
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
                { mode === MODE_GRID 
                    ? <BoardGrid
                        boards={boards}
                        selections={selections}
                        onSelect={this.handleSelect}
                    />
                    : <BoardList
                        boards={boards}
                        selections={selections}
                        onSelect={this.handleSelect}
                    />
                }
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

function Spacer({ width }) {
    return (
        <span style={{ width }}/>
    );
}

function ModeSelect({ mode, icon, currentMode, onSelect }) {
    return (
        <i
            className={`fa fa-${icon} fa-lg`}
            style={{
                color: "#ffffff",
                opacity: mode === currentMode ? 1.0 : 0.5
            }}
            onClick={() => {
                if (onSelect) {
                    onSelect(mode);
                }
            }}
        />
    );
}

function BoardGrid({ boards, selections, onSelect }) {
    return (
        <div className="main-menu-board-grid-container">
            {boards.map((data, id) =>
                <MainMenuGridItem
                    div key={id}
                    isSelected={selections.has(id)}
                    onSelect={onSelect}
                    {...data}
                />
            ).toList()}
        </div>
    );
}

function BoardList({ boards, selections, onSelect }) {
    return (
        <div className="main-menu-board-list-container">
            {boards.map((data, id) =>
                <MainMenuListItem
                    div key={id}
                    isSelected={selections.has(id)}
                    onSelect={onSelect}
                    {...data}
                />
            ).toList()}
        </div>
    );
}

export default MainMenu;
