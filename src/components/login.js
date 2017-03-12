import React, { createClass } from "react";

const Login = createClass({
    getInitialState: function() {
        return {
            username: "",
            password: ""
        };
    },

    render: function() {
        const { username, password } = this.state;

        return (
            <div className="unauthed-container">
                <img
                    className="unauthed-logo"
                    src="/image/aivo-logo.png"/>

                <form
                    name="login"
                    onSubmit={this.handleSubmit}>

                    <div className="unauthed-title">
                        Sign in to your account
                    </div>
                    <div style={{ height: 48 }}/>
                    <div>
                        <div className="unauthed-field">
                            <i className="fa fa-envelope unauthed-field-icon"/>
                            <input
                                className="unauthed-field-input"
                                placeholder="Email"
                                type="text"
                                name="username"
                                value={username}
                                onChange={this.handleUsernameChange}/>
                        </div>
                    </div>
                    <div style={{ height: 52 }}/>
                    <div>
                        <div className="unauthed-field">
                            <i className="fa fa-lock unauthed-field-icon"/>
                            <input
                                className="unauthed-field-input"
                                placeholder="Password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={this.handlePasswordChange}/>
                        </div>
                    </div>
                    <div style={{ height: 61 }}/>
                    <div>
                        <input
                            className="unauthed-button"
                            type="submit"
                            value="Sign In"/>
                    </div>
                </form>
            </div>
        );
    },

    handleUsernameChange: function(e) {
        this.setState({
            username: e.target.value
        });
    },

    handlePasswordChange: function(e) {
        this.setState({
            password: e.target.value
        });
    },

    handleSubmit: function(e) {
        e.preventDefault();

        const { tryLogin } = this.props;
        const { username, password } = this.state;

        tryLogin(username, password);
    }
});

export default Login;
