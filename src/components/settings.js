import React, { createClass } from "react";

const Settings = createClass({
    render: function() {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                <div
                    style={{
                        width: 800,
                        alignContent: "left",
                        fontSize: "36px",
                        color: "#787c96"
                    }}>
                    Settings
                </div>
                <div
                    style={{
                        width: 800,
                        height: 854,
                        backgroundColor: "#ffffff",
                        border: "solid 1px #c5c5c5"
                    }}>

                    PLACEHOLDER

                </div>
            </div>
        );
    }
});

export default Settings;
