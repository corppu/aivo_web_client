import React, { createClass } from "react";

const Settings = createClass({
    render: function() {
         const profilePictureURL = "http://i.imgur.com/qIdgB8D.png"

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
                        fontSize: 36,
                        color: "#787c96"
                    }}>
                    Settings
                </div>
                <div
                    style={{
                        boxSizing: "border-box",
                        width: 800,
                        height: 854,
                        backgroundColor: "#ffffff",
                        border: "solid 1px #c5c5c5",
                        padding: 24,
                        paddingTop: 11
                    }}>
                    <Title text="Personal details"/>
                    <div
                        style={{
                            display: "flex"
                        }}>
                        <div
                            style={{
                                flexGrow: 1000
                            }}>
                            <Field title="Full name"/>
                            <Field title="Username"/>
                            <Field title="Tell about yourself"/>
                        </div>
                        <div
                            style={{
                                width: 200,
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "#787c96"
                            }}>
                            Profile photo
                            <div
                                style={{
                                    marginTop: 8,
                                    width: 200,
                                    height: 200,
                                    overflow: "hidden",
                                    borderRadius: 2,
                                    border: "solid 1px #c5c5c5"
                                }}>
                                <img
                                    style={{
                                        width: "100%"
                                    }}
                                    src={profilePictureURL}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

function Title({ text }) {
    return (
         <div
            style={{
                width: "100%",
                fontSize: 24,
                fontWeight: "bold",
                color: "#787c96",
                alignContent: "left"
            }}>
            { text }
        </div>
    );
}

function Field({ title }) {
    return (
        <div>
            <div
                style={{
                    width: 142,
                    height: 28,
                    fontSize: 20,
                    color: "#787c96"
                }}>
                { title }
            </div>
            <input
                style={{
                    width: 270,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    border: "solid 1px #c5c5c5"
                }}
            />
        </div>
    );
}

export default Settings;
