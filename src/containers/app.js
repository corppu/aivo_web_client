import { connect } from "react-redux"

import App from "../components/app"

function mapStateToProps(state, ownProps) {
    const { auth } = state
    const { children } = ownProps

    return {
        authed: auth.get("authed"),
        children
    }
}

export default connect(mapStateToProps)(App)
