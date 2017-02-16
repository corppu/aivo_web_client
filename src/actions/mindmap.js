import {
	INIT_BOARD,
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
	console.log(object);
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
					lines : Object.assign( { }, parent.lines )
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

// TODO: change to some utils or smthng
function calcSize( obj )
{
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}

export function tryRemoveObject(
	primaryType,
	id
	// data,,
	// lineMap = null,
	// nodeMap = null,
	// pinMap = null
) {
	if ( !( primaryType && id ) ) {
		throw( "invalid primaryType || id");
	}
	
	/*
	console.log(primaryType);
	console.log(id);
	*/

	return function ( dispatch, getState ) {

		const { mindmap } = getState();
        const boardID = mindmap.get( "boardID" );
        
		if ( !boardID ) {
            return;
        }
	
		// Push the object to removables array....
		var removable = { 
			primaryType,
			id
		};
		var removables = [ removable ];
		
		var copiesForUpdate = [ ];
		
		if( primaryType !== TYPE_LINE ) {
			var otherData;
			var otherCopy;
		
			var lines = mindmap.get( primaryType + "s" ).get( id ).get( TYPE_LINE + "s" );
			
			if( !lines ) {
				console.log( "NO LINES FOUND FOR " + primaryType + " " + id );
			}
			
			else {
				lines = lines.toJS();
				// Loop through the lines that are connected to the object...
				for( var lineId in lines ) {
					otherData = mindmap.get(TYPE_LINE + "s").get( lineId );
					
					if( !otherData ) {
						console.log(mindmap.get(TYPE_LINE + "s"));
						console.warn( "mindmap does not contain key " + lineId );

						continue;
					}
					
					// Push the line to removables array...
					otherData = otherData.toJS();
					removable = { 
						primaryType : otherData.primaryType,
						id : otherData.id
					};
					removables.push( removable );
				
					// The object is assigned as parent in the line...
					if( otherData.parentId === id ) {
						removeLineHelper(
							otherData.id,
							otherData.childType === TYPE_NODE ? mindmap.get(TYPE_NODE + "s").get( otherData.childId ).toJS() 
								: mindmap.get(TYPE_PIN + "s").get( otherData.childId ).toJS(),
							
							removables,
							copiesForUpdate
						);
					}
					else { // The object is assigned as child in the line...
						removeLineHelper(
							otherData.id,
							otherData.parentType === TYPE_NODE ? mindmap.get(TYPE_NODE + "s").get( otherData.parentId ).toJS() 
								: mindmap.get(TYPE_PIN + "s").get( otherData.parentId ).toJS(),
							
							removables,
							copiesForUpdate
						);
					}
				}
			} 
			
		} else if ( primaryType === TYPE_LINE ) {
			
			var data = mindmap.get(TYPE_LINE + "s")
			removeLineHelper( 
				data.id,
				data.childType === TYPE_NODE ? mindmap.get(TYPE_NODE + "s").get( data.childId ).toJS() 
					: mindmap.get(TYPE_PIN + "s").get( data.childId ).toJS(),
				
				removables,
				copiesForUpdate
			);
			
			removeLineHelper(
				data.id,
				data.parentType === TYPE_NODE ? mindmap.get(TYPE_NODE + "s").get( data.parentId ).toJS() 
					: mindmap.get(TYPE_PIN + "s").get( data.parentId ).toJS(),
							
				removables,
				copiesForUpdate
			);
		}
		else {
			throw( "null or undefined variable" );
		}
        backendAdapter.removeObjects( boardID, removables, copiesForUpdate );
		
		// console.log(removables);
		// console.log(copiesForUpdate);
		//dispatch( removeObjects( removables, copiesForUpdate ) );
    };
}


// TODO: Rename?
function removeLineHelper(
	lineId,
	otherData,
	
	removables,
	copiesForUpdate
) {
	if( otherData.primaryType === TYPE_PIN &&  
		calcSize( otherData.lines ) < 2 
	) { 
		removables.push( { 
			primaryType : otherData.primaryType,
			id : otherData.id
		} );
	}
	
	else {
		var otherCopy = { };
		Object.assign(
			otherCopy,
			{
				id : otherData.id,
				primaryType : otherData.primaryType,
				x : otherData.x,
				y : otherData.y,
				lines : Object.assign( { }, otherData.lines )
			}
		);
		
		otherCopy.lines[ lineId ] = null;
		
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
		
		console.log("ALKUPERÄINEN");
		console.log(otherData.lines);
		console.log("KOPIO");
		console.log(otherCopy.lines);
		
		
		copiesForUpdate.push( otherCopy );
	}
}


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
				title : data.title || null,
				type : data.type || null,
				parentType : data.parentType || null,
				parentId : data.parentId || null,
				childType : data.childType || null,
				childId : data.childId || null,
			}
		);
		
		dispatch( updateObject( dataCopy ) );
        backendAdapter.updateObject( boardID, dataCopy );
    };
}

export function initBoard( data ) {
	return { type: INIT_BOARD, data };
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

