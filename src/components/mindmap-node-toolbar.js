import React, { createClass } from "react";

import { translateToCamera } from "../utils/canvas-utils";

import {
    NODE_TYPE_TEXT,
    NODE_TYPE_FILE,
    NODE_TYPE_TODO,

    TYPE_CLUSTER
} from "../constants/types";

const STATE_NONE = "";
const STATE_TYPE_SELECT = "TYPE_SELECT";
const STATE_STYLE_SELECT = "STYLE_SELECT";
const STATE_COLOR_SELECT = "COLOR_SELECT";

const MindMapNodeToolbar = createClass({
    getInitialState: function() {
        return {
            subMenuState: STATE_TYPE_SELECT
        }
    },

    render: function() {
        const { id, data, canvasCamera, remove } = this.props;
        const type = data.type || "Type";

        const pos = translateToCamera(
                { x: -canvasCamera.x, y: -canvasCamera.y },
                { x: data.x, y: data.y });

        return (
            <div
                className="noselect"
                style={{
                    position: "fixed",
                    left: pos.x + 48,
                    top: pos.y - 64,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    cursor: "default"
                }}>
                <div>
                    <div
                        style={{
                            padding: "5px 10px",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 4px 1px #cecece"
                        }}>
                        <i
                            className="fa fa-circle-o fa-lg pointer"
                            onClick={() => { this.setSelection(STATE_COLOR_SELECT); }}/>
                        <Separator/>
                        <i
                            className="fa fa-circle fa-lg pointer"
                            onClick={() => { this.setSelection(STATE_STYLE_SELECT); }}/>
                        <Separator/>
                        <span
                            className="pointer"
                            onClick={() => { this.setSelection(STATE_TYPE_SELECT); }}>
                            { type }
                        </span>
                        <Separator/>
                        <i
                            className="fa fa-trash-o fa-lg pointer"
                            onClick={remove}/>
                    </div>
                </div>
                { this.renderSubMenu() }
            </div>
        );
    },

    renderSubMenu: function() {
        const { subMenuState } = this.state;

        let menu = null;
        switch (subMenuState) {
            case STATE_TYPE_SELECT:
                menu = <TypeSelect handleSelect={this.handleTypeSelect}/>;
                break;

            case STATE_STYLE_SELECT:
                menu = <StyleSelect/>;
                break;

            case STATE_COLOR_SELECT:
                menu = <ColorSelect/>;
                break;
        }
        if (!menu) {
            return null;
        }
        return (
            <div
                style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px 1px #cecece"
                }}>
                { menu }
            </div>
        );
    },

    setSelection: function(newState) {
        const { subMenuState } = this.state;

        if (subMenuState === newState) {
            this.setState({ subMenuState: STATE_NONE });
        } else {
            this.setState({ subMenuState: newState });
        }
    },

    handleTypeSelect: function(type) {
        const { update } = this.props;

        update({ type });
    }
});

function TypeSelect({ handleSelect }) {
    return (
        <div
            style={{
                display: "flex"
            }}>
            <TypeSelectItem
                iconClass="fa-file-text-o"
                labelText="Note"
                onClick={() => { handleSelect(NODE_TYPE_TEXT) }}/>

            <TypeSelectItem
                iconClass="fa-file-image-o"
                labelText="File"
                onClick={() => { handleSelect(NODE_TYPE_FILE) }}/>

            <TypeSelectItem
                iconClass="fa-check-square-o"
                labelText="To-Do"
                onClick={() => { handleSelect(NODE_TYPE_TODO) }}/>

            <TypeSelectItem
                iconClass="fa-share-alt"
                labelText="Group"
				onClick={() => { handleSelect(TYPE_CLUSTER) }}/>

        </div>
    );
}

function TypeSelectItem({ iconClass, labelText, onClick }) {
    return (
        <div
            className="pointer"
            onClick={onClick}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    width: 64,
                    height: 64,
                    margin: "8px 8px 0 8px",
                    borderWidth: 2,
                    borderRadius: 34,
                    borderStyle: "solid"
                }}>
                <i className={`fa ${iconClass} fa-2x`}/>
            </div>
            <div
                style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    textAlign: "center"
                }}>
                { labelText }
            </div> 
        </div>
    );
}

function StyleSelect() {
     return (
        <div
            style={{
                fontWeight: "bold",
                padding: 8
            }}>
            STYLE SELECT NOT IMPLEMENTED!
        </div>
    );
}

function ColorSelect() {
    return (
        <div
            style={{
                fontWeight: "bold",
                padding: 8
            }}>
            COLOR SELECT NOT IMPLEMENTED!
        </div>
    );
}

function Separator() {
    const style = {
        color: "#000"
    };
    return (
        <span style={style}> | </span>
    );
}

export default MindMapNodeToolbar;
