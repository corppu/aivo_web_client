import {
    UPDATE_BOARD,
	// REMOVE_BOARD,
	UPDATE_OBJECT,
	// MOVE_OBJECT,
	REMOVE_OBJECT,
	REMOVE_OBJECTS
} from "../constants/action-types";

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT,
	TYPE_NODE,
	TYPE_LINE,
	TYPE_NONE,
	TYPE_PIN
} from "../constants/types";


import * as backendAdapter from "../backend/backend-adapter";


export function tryCreateObject(
	object,
	parent = null,
	line = null
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        if (!boardID) {
            return;
        }
		
		var parentCopy = null;
		if( parent ) {
			parentCopy = { };
			Object.assign(
				parentCopy,
				{
					id : parent.id,
					primaryType : parent.primaryType,
					x : parent.x,
					y : parent.y,
					lines : parent.lines
				}
			);
			
			
			if( parent.primaryType === TYPE_NODE ) {
				Object.assign(
					parentCopy,
					{
						title : parent.title || null,
						type : parent.type || NODE_TYPE_UNDEFINED,
						text: parent.text || null,
						imgURL: parent.imgURL || null,
					}
				);
			}
		}
        backendAdapter.createObject( boardID, object, parentCopy, line );
    };
}


export function tryRemoveObject(
	data,
	lineMap = null,
	nodeMap = null,
	pinMap = null
) {
	return function ( dispatch, getState ) {

		const { mindmap } = getState();
        const boardID = mindmap.get( "boardID" );
        
		if ( !boardID ) {
            return;
        }
	
		var removable = { 
			primaryType : data.primaryType,
			id : data.id
		};
		
		var removables = [ removable ];
	
		var copiesForUpdate = [ ];
		
		if( data.primaryType !== TYPE_LINE && lineMap && nodeMap && pinMap && data.lines ) {
			
			var otherData;
			var otherCopy;
		
			if( data.lines ) {
			
				for( var lineId in data.lines ) {
					
					otherData = lineMap.get( lineId );
										
					removable = { 
						primaryType : otherData.primaryType,
						id : otherData.id
					};
					
					removables.push( removable );
				
					if( otherData.parentId === data.id ) {
						otherData = otherData.childType === TYPE_NODE ? nodeMap.get( otherData.childId ) 
							: pinMap.get( otherData.childId );
					}
					else {
						otherData = otherData.parentType === TYPE_NODE ? nodeMap.get( otherData.parentId ) 
							: pinMap.get( otherData.parentId );
					}


					otherCopy = { };
					Object.assign(
						otherCopy,
						{
							id : otherData.id,
							primaryType : otherData.primaryType,
							x : otherData.x,
							y : otherData.y,
							lines : otherData.lines
						}
					);
					
					delete otherCopy.lines[ lineId ];
					
					
					if( otherData.primaryType === TYPE_NODE ) {
						Object.assign(
							otherCopy,
							{
								title : otherData.title || null,
								type : otherData.type || NODE_TYPE_UNDEFINED,
								text: otherData.text || null,
								imgURL: otherData.imgURL || null,
							}
						);
					}
					
					copiesForUpdate.push( otherCopy );
				}
			}
		}
		
		dispatch( removeObjects( removables, copiesForUpdate ) );
        backendAdapter.removeObjects( boardID, removables, copiesForUpdate );
    };
}

// export function tryMoveObject(
	// object
// ) {
	// return function ( dispatch, getState ) {
        // const { mindmap } = getState();

        // const boardID = mindmap.get("boardID");
        // if (!boardID) {
            // return;
        // }
        // backendAdapter.moveObject(boardID, object);
    // };
// }

export function tryUpdateObject(
	data
) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get("boardID");
        
		if ( !boardID  || !data || !data.primaryType ) {
            return;
        }
		
		var dataCopy = { }; 
		Object.assign(
			dataCopy, 
			{
				id : data.id,
				primaryType : data.primaryType,
				x : data.x || null,
				y : data.y || null,
				lines : data.lines || null,
				imgURL : data.imgURL || null,
				title: data.title || null,
				type : data.type || null
			}
		);
		
        backendAdapter.updateObject( boardID, dataCopy );
    };
}

export function updateBoard( data ) {
    return { type: UPDATE_BOARD, data };
}

export function updateObject( data ) {
    return { type: UPDATE_OBJECT, data };
}

export function createObject( data, parentData, lineData ) {
	return { type: CREATE_OBJECT, data, parentData, lineData };
}

export function removeObjects( removables, copiesForUpdate ) {
	return { type: REMOVE_OBJECTS, removables, copiesForUpdate };
}

export function removeObject( data ) {
    return { type: REMOVE_OBJECT, data };
}

// export function moveObject( data ) {
    // return { type: MOVE_OBJECT, data };
// }

