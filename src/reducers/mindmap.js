import * as immutable from "immutable";


import {
	INIT_BOARD,
    UPDATE_BOARD,
	// REMOVE_BOARD,
	
	UPDATE_OBJECT,
	
	REMOVE_OBJECT,
	REMOVE_OBJECTS,
	
    LIST_UPDATE,
    LIST_REMOVE
} from "../constants/action-types";


function clean(obj) {
  for (var propName in obj) { 
    if (obj[propName] === null || obj[propName] === undefined) {
      console.warn(obj);
	  delete obj[propName];
    }
  }
}


const initialState = immutable.fromJS({
	
	boardID: null,
    boardData: null,
    
	nodes: {},
	lines: {},
	pins: {},
	
    boards: {}
});



function mapData( data ) {
	/*console.log( data );
	var dataMap = new Map();
	var obj = null;
	
	for ( var propName in data ) {
		obj = data[ propName ];
		console.log( obj.id );
		dataMap.set( obj.id, obj );
	}
	
	console.log(dataMap);
	return immutable.fromJS( dataMap );
	*/
	
	return new immutable.Map( immutable.fromJS( data ) );
}



export default function( state = initialState, action ) {

	/*
	console.log(action);
	console.log(state.toJS());
	*/

    switch ( action.type ) {
    
	case INIT_BOARD:
	{
		const { data } = action;
		console.log( data );
		state = state
			.set( "nodes", mapData( data.nodes ) )
			.set( "lines", mapData( data.lines ) )
			.set( "pins", mapData( data.pins ) )
            .set( "boardID", immutable.fromJS( data.meta.id ) )
            .set( "boardData", immutable.fromJS( data.meta ) );
		
		return state;
	}
	
	case UPDATE_BOARD:
    {
        const { data } = action;
		// clean( data );
        // if (data.id !== state.get( "boardID" ) ) {
			
            // state = state
				// .set( "nodes", Immutable,Map() )
				// .set( "lines", immutable.Map() )
				// .set( "pins", immutable.Map() );
        // }
		
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
				const immutableData = immutable.fromJS( data );

				return immutableData;
				// return prop ? prop.merge( immutableData ) : immutableData;
			}
		);
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
					const immutableData = immutable.fromJS( data );

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
        return state.setIn( [ "boards", data.id ], data );
    }
	
    case LIST_REMOVE:
    {
        const { data } = action;
		clean( data );
        return state.deleteIn( [ "boards", data.id ] );
    }
	
    default:
        return state;
    }
}
