import { connect } from "react-redux";

import BoardList from "../components/board-list";

import { tryCreateBoard } from "../actions/backend";

function mapStateToProps(state) {
    const { mindmap } = state;

    console.log(mindmap.toJS());

    return {
        boards: mindmap.get("boards")
    };
}

export default connect(mapStateToProps, { tryCreateBoard })(BoardList);
