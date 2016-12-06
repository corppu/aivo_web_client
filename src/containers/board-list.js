import { connect } from "react-redux";

import BoardList from "../components/board-list";

import { tryCreateBoard } from "../actions/backend";

function mapStateToProps() {
    return {};
}

export default connect(mapStateToProps, { tryCreateBoard })(BoardList);