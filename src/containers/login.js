import { connect } from "react-redux"

import Login from "../components/login"

import { tryLogin, tryCreateUser } from "../actions/backend"

export default connect(null, { tryLogin, tryCreateUser })(Login)
