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
                    justifyContent: "center",
                    alignItems: "flex-end"
                }}>
                <div>
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
                </div>
                { this.renderSubMenu() }
            </div>
        );
    },

    renderSubMenu: function() {
        const { subMenuState } = this.state;

        let menu = null;
        switch (subMenuState) {
            case STATE_TYPE_SELECT:     menu = <TypeSelect/>; break;
            case STATE_STYLE_SELECT:    menu = <StyleSelect/>; break;
            case STATE_COLOR_SELECT:    menu = <ColorSelect/>; break;
        }
        if (!menu) {
            return null;
        }
        return (
            <div
                style={{
                    marginLeft: 10, // for temp layout
                    padding: 8,
                    backgroundColor: "#fff"
                }}>
                { menu }
            </div>
        );
    }
});

function TypeSelect() {
    return (
        <div
            style={{
                display: "flex"
            }}>
            <TypeSelectItem
                iconClass="fa-file-text-o"
                labelText="Note"/>

            <TypeSelectItem
                iconClass="fa-file-image-o"
                labelText="File"/>

            <TypeSelectItem
                iconClass="fa-check-square-o"
                labelText="To-Do"/>

            <TypeSelectItem
                iconClass="fa-share-alt"
                labelText="Group"/>
        </div>
    );
}

function TypeSelectItem({ iconClass, labelText, handleSelect }) {
    return (
        <div>
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
