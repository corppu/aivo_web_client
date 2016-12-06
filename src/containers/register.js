import { connect } from "react-redux";

import Register from "../components/register";

import { tryCreateUser } from "../actions/backend";

export default connect(null, { tryCreateUser })(Register);
