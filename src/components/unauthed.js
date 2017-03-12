import React, { createClass } from "react";

import Login from "../containers/login";
import Register from "../containers/register";

const Unauthed = createClass({
    getInitialState: function() {
        return {
            showRegister: false
        }
    },

    render: function() {
        const { showRegister } = this.state;

        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    backgroundImage: "linear-gradient(233deg, #0eb1f9, #673ac3)",
                    minHeight: "100%"
                }}>
                
                { showRegister ? this.renderRegister() : this.renderLogin() }
            </div>
        );
    },

    renderLogin: function() {
        return (
            <div>
                <Login/>
                <div
                    style={{
                        color: "blue",
                        textDecoration: "underline",
                        cursor: "pointer"
                    }}
                    onClick={this.flipShowRegister}>

                    Not registered?
                </div>
            </div>
        );
    },

    renderRegister: function() {
        return (
            <div>
                <Register/>
                <div
                    style={{
                        color: "blue",
                        textDecoration: "underline",
                        cursor: "pointer"
                    }}
                    onClick={this.flipShowRegister}>

                    Already registered?
                </div>
            </div>
        );
    },

    flipShowRegister: function() {
        const { showRegister } = this.state;
        
        this.setState({
            showRegister: !showRegister
        });
    }
});

export default Unauthed;
