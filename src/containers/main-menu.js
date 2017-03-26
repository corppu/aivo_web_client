import { connect } from "react-redux";

import MainMenu from "../components/main-menu";

import { tryCreateBoard, tryRemoveBoard } from "../actions/backend";

function mapStateToProps(state) {
    const { mindmap } = state;

    return {
        boards: mindmap.get("boards")
    };
}

export default connect(mapStateToProps, {
    tryCreateBoard,
    tryRemoveBoard
})(MainMenu);
