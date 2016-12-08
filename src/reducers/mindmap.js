import { fromJS } from "immutable";

import {
    UPDATE_BOARD,
    UPDATE_NODE,
    REMOVE_NODE,
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";

const initialState = fromJS({
    boardID: null,
    nodes: {},
    boards: {}
});

export default function(state = initialState, action) {
    switch (action.type) {
    case UPDATE_BOARD:
    {
        const { id, data } = action;

        if (id !== state.get("boardID")) {
            state = state.clear("nodes");
        }
        return state.set("boardID", id);
    }
    case UPDATE_NODE:
    {
        const { id, data } = action;

        return state.updateIn(["nodes", id], node => {
            const immutableData = fromJS(data);

            return node ? node.merge(immutableData) : immutableData;
        });
    }
    case REMOVE_NODE:
    {
        const { id } = action;

        return state.deleteIn(["nodes", id]);
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
