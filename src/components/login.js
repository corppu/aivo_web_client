import React, { createClass } from "react"

const Login = createClass({
    getInitialState: function() {
        return {
            username: "",
            password: "",
        };
    },

    render: function() {
        const { username, password } = this.state;

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        Auth required!
                    </div>
                    <div>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={this.handleUsernameChange}/>
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={this.handlePasswordChange}/>
                    </div>
                    <div>
                        <input
                            type="submit"
                            value="login"/>
                    </div>
                </form>
            </div>
        )
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
        const { username, password } = this.state;

        console.log(username, password)

        e.preventDefault();
    }
})

export default Login;
