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
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        Create new user?
                    </div>
                    <div>
                        <label>
                            Username:
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={this.handleUsernameChange}/>
                        </label>
                    </div>
                    <div>
                        <label>
                            Password:
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={this.handlePasswordChange}/>
                        </label>
                    </div>
                    <div>
                        <input
                            type="submit"
                            value="register"/>
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
