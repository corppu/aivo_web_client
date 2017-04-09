import React, { createClass } from "react";

import {
    TYPE_NODE,
    TYPE_LINE,
    TYPE_NONE,
    TYPE_PIN,
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
        const { id, data, update, remove } = this.props;
        const type = data.type || "Type";

        return (
            <div
                style={{
                    display: "flex",
                    position: "fixed",
                    bottom: 20,
                    width: "100%",
                    justifyContent: "center"
                }}>
                <div
                    style={{
                        padding: "5px 10px",
                        backgroundColor: "#fff"
                    }}>
                    <i
                        className="fa fa-circle-o fa-lg"
                        onClick={() => {
                            update({
                                // primaryType: TYPE_CLUSTER
                            });
                        }}/>
                    <Separator/>
                    <i
                        className="fa fa-circle fa-lg"
                        onClick={() => {
                            update({ customColor: "green" });
                        }}/>
                    <Separator/>
                    { type }
                    <Separator/>
                    <i
                        className="fa fa-trash-o fa-lg"
                        onClick={remove}/>
                </div>
                { this.renderSubMenu() }
            </div>
        );
    },

    renderSubMenu: function() {
        const { subMenuState } = this.state;

        let child = null;
        switch (subMenuState) {
            case STATE_TYPE_SELECT:     child = <TypeSelect/>; break;
            case STATE_STYLE_SELECT:    child = <StyleSelect/>; break;
            case STATE_COLOR_SELECT:    child = <ColorSelect/>; break;
        }
        if (!child) {
            return null;
        }
        return (
            <div
                style={{
                    marginLeft: 10, // for temp layout
                    backgroundColor: "#fff"
                }}>
                { child }
            </div>
        );
    }
});

/*
    fa-file-text-o
    fa-file-image-o
    fa-check-square-o
    fa-share-alt
*/

function TypeSelect() {
    return (
        <div>
            TYPE SELECT PLACEHOLDER
        </div>
    );
}

function StyleSelect() {
     return (
        <div>STYLE SELECT PLACEHOLDER</div>
    );
}

function ColorSelect() {
    return (
        <div>COLOR SELECT PLACEHOLDER</div>
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
