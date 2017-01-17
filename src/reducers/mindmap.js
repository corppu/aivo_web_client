import { fromJS, Map } from "immutable";

import {
    UPDATE_BOARD,
	// REMOVE_BOARD,
	
	UPDATE_OBJECT,
	
	REMOVE_OBJECT,
	REMOVE_OBJECTS,
	
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";

const initialState = fromJS({
	
	boardID: null,
    boardData: null,
    
	nodes: {},
	lines: {},
	pins: {},
	
    boards: {}
});

export default function( state = initialState, action ) {

    switch ( action.type ) {
    case UPDATE_BOARD:
    {
        const { data } = action;

        if (data.id !== state.get( "boardID" ) ) {
			
            state = state
				.set( "nodes", Map() )
				.set( "lines", Map() )
				.set( "pins", Map() );
        }
		
        return state
            .set( "boardID", data.id )
            .set( "boardData", data );
    }
    
	
	case UPDATE_OBJECT:
    {
        const { data } = action;

		return state.updateIn( 
			
			[ data.primaryType + "s", data.id ], 
			
			prop => {
				const immutableData = fromJS( data );

				return prop ? prop.merge( immutableData ) : immutableData;
			}
		);
    }

	
    case REMOVE_OBJECT:
    {
        const { data } = action;

        return state.deleteIn( [ data.primaryType + "s", data.id ] );
    }
	
	case REMOVE_OBJECTS:
	{
		const { removables, copiesForUpdate } = action;
		var i = 0;
		var data;
		
		for(; i < removables.length; ++i) {
			data = removables[ i ];
			state.deleteIn( [ data.primaryType + "s", data.id ] );
		}
		
		for(i = 0; i < copiesForUpdate.length; ++i) {
			data = copiesForUpdate[ i ];
			state.updateIn( 
				
				[ data.primaryType + "s", data.id ], 
				
				prop => {
					const immutableData = fromJS( data );

					return prop ? prop.merge( immutableData ) : immutableData;
				}
			);
		}
		
		return state;
	}
	
    case LIST_UPDATE:
    {
        const { data } = action;

        return state.setIn( [ "boards", data.id ], data );
    }
	
    case LIST_REMOVE:
    {
        const { data } = action;

        return state.deleteIn( [ "boards", data.id ] );
    }
	
    default:
        return state;
    }
}
