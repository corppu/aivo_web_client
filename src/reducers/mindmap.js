import { fromJS, Map } from "immutable";


import {
    UPDATE_BOARD,
	REMOVE_BOARD,
	
	UPDATE_OBJECT,
	UPDATE_OBJECTS,
	
	REMOVE_OBJECT,
	REMOVE_OBJECTS,
	
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";


function clean(obj) {

	// made a no-op to see if this is actually needed

	/*
	for (var propName in obj) { 
		if (obj[propName] === null || obj[propName] === undefined) {
			delete obj[propName];
		}
	}
	*/
}


const initialState = fromJS({
	
	boardID: null,
    boardData: null,
    
	nodes: {},
	lines: {},
	pins: {},
	
    boards: {}
});

export default function( state = initialState, action ) {

	console.log(action);
	//console.log(state.toJS());

    switch ( action.type ) {
    case UPDATE_BOARD:
    {
        const { data } = action;
		clean( data );
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
		clean(data);
		
		return state.updateIn( 
		
			[ data.primaryType + "s", data.id ], 
			
			prop => {
				const immutableData = fromJS( data );

				return prop ? prop.merge( immutableData ) : immutableData;
			}
		);
    }

	case UPDATE_OBJECTS:
    {
        const { data } = action;
		
		for( var i = 0; i < data.length; ++i ) {
			clean( data[ i ] );
			
			state = state.updateIn( 
			
				[ data[ i ].primaryType + "s", data[ i ].id ], 
				
				prop => {
					const immutableData = fromJS( data[ i ] );

					return prop ? prop.merge( immutableData ) : immutableData;
				}
			);
		}
		return state;
	}
	
    case REMOVE_OBJECT:
    {
        const { data } = action;
		clean(data);
        return state.deleteIn( [ data.primaryType + "s", data.id ] );
    }
	
	case REMOVE_OBJECTS:
	{
		console.log(action);
		const { removables, copiesForUpdate } = action;

		var i = 0;
		var data;
		
		for(; i < removables.length; ++i) {
			data = removables[ i ];
			state = state.deleteIn( [ data.primaryType + "s", data.id ] );
		}
		
		for(i = 0; i < copiesForUpdate.length; ++i) {
			data = copiesForUpdate[ i ];
			clean( data );
			if( data.lines ) {
				clean( data.lines );
			}
			state = state.updateIn( 
				
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

		clean( data );

		if (!data) {
			return state;
		}
        return state.setIn( [ "boards", data.id ], data );
    }
	
    case LIST_REMOVE:
    {
        const { boardId } = action;
		clean( data );
        return state.deleteIn( [ "boards", boardId ] );
    }
	
    default:
        return state;
    }
}
