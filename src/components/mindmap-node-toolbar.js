import React, { createClass } from "react";

const STATE_NONE = ""
const STATE_TYPE_SELECT = "TYPE_SELECT"
const STATE_STYLE_SELECT = "STYLE_SELECT"
const STATE_COLOR_SELECT = "COLOR_SELECT"

const MindMapNodeToolbar = createClass({
    getInitialState: function() {
        return {
            subMenuState: STATE_NONE
        }
    },

    render: function() {
        const { id, primaryType } = this.props;

        return (
            <div
                style={{
                    display: "flex",
                    position: "fixed",
                    bottom: 10,
                    width: "100%",
                    justifyContent: "center"
                }}>
                <div
                    style={{
                        padding: "5px 10px",
                        backgroundColor: "#fff"
                    }}>
                    { id }
                    <Separator/>
                    { primaryType }
                    <Separator/>                    
                    <i className="fa fa-trash-o fa-lg"></i>
                </div>
            </div>
        );
    },

    renderSubMenu: function() {
        const { subMenuState } = this.state;

        switch (subMenuState) {
            case STATE_TYPE_SELECT:     return this.renderTypeSelect;
            case STATE_STYLE_SELECT:     return this.renderStyleSelect;
            case STATE_COLOR_SELECT:     return this.renderColorSelect;
        }
        return null;
    },

    renderTypeSelect: function() {
        return (
            <div>type select</div>
        );
    },

    renderStyleSelect: function() {
        return (
            <div>style select</div>
        );
    },

    renderColorSelect: function() {
        return (
            <div>color select</div>
        );
    }
});

function Separator() {
    return (
        <span> | </span>
    );
}

export default MindMapNodeToolbar;
