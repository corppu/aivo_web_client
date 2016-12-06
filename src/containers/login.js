import { connect } from "react-redux";

import Login from "../components/login";

import { tryLogin } from "../actions/backend";

export default connect(null, { tryLogin })(Login);
