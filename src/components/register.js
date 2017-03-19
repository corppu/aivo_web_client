import React, { createClass } from "react";

const Register = createClass({
    getInitialState: function() {
        return {
            username: "",
            password: ""
        }
    },
    
    render: function() {
        const { username, password } = this.state;
    
        return (
            <div className="unauthed-container">
                <img
                    className="unauthed-logo"
                    src="/image/aivo-logo.png"/>

                <form
                    name="register"
                    onSubmit={this.handleSubmit}>

                    <div className="unauthed-title">
                        Register your account
                    </div>
                    <div style={{ height: 48 }}/>
                    <div>
                        <div className="unauthed-field">
                            <i className="fa fa-envelope unauthed-field-icon"/>
                            <input
                                 className="unauthed-field-input"
                                type="text"
                                name="username"
                                placeholder="Email"
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
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={this.handlePasswordChange}/>
                        </div>
                    </div>
                    <div style={{ height: 61 }}/>
                    <div>
                        <input
                            className="unauthed-button"
                            type="submit"
                            value="Register now"/>
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

        const { tryCreateUser } = this.props;
        const { username, password } = this.state;

        tryCreateUser(username, password);
    }
});

export default Register;
