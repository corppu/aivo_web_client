import { fromJS, Map } from "immutable";

import {
    UPDATE_BOARD,
    UPDATE_NODE,
	UPDATE_LINE,
    REMOVE_NODE,
	REMOVE_LINE,
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";

const initialState = fromJS({
    boardID: null,
    boardData: null,
    nodes: {},
	lines: {},
    boards: {}
});

export default function(state = initialState, action) {

    //console.log(action);

    switch (action.type) {
    case UPDATE_BOARD:
    {
        const { id, data } = action;

        if (id !== state.get("boardID")) {
            state = state.set("nodes", Map());
        }
        return state
            .set("boardID", id)
            .set("boardData", data);
    }
    case UPDATE_NODE:
    {
        const { id, data } = action;

        return state.updateIn(["nodes", id], node => {
            const immutableData = fromJS(data);

            return node ? node.merge(immutableData) : immutableData;
        });
    }
	case UPDATE_LINE:
	{
		const { id, data } = action;
		
		return state.updateIn(["lines", id], line => {
			const immutableData = fromJS(data);

            return line ? line.merge(immutableData) : immutableData;
		});
	}
    case REMOVE_NODE:
    {
        const { id } = action;

        return state.deleteIn(["nodes", id]);
    }
	case REMOVE_LINE:
	{
		const { id } = action;

        return state.deleteIn(["lines", id]);
	}
    case LIST_UPDATE:
    {
        const { id, data } = action;

        return state.setIn(["boards", id], data);
    }
    case LIST_REMOVE:
    {
        const { id } = action;

        return state.deleteIn(["boards", id]);
    }
    default:
        return state;
    }
}
