import {
    UPDATE_BOARD,
	// REMOVE_BOARD,
	UPDATE_OBJECT,
	UPDATE_OBJECTS,
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
				for( var lineId in lines ) {
					
					otherData = mindmap.get(TYPE_LINE + "s").get( lineId );
					
					if( !otherData ) {
						console.log(mindmap.get(TYPE_LINE + "s"));
						console.warn( "mindmap does not contain key " + lineId );

						continue;
					}
					
					otherData = otherData.toJS();
					removable = { 
						primaryType : otherData.primaryType,
						id : otherData.id
					};
					
					removables.push( removable );
				
					if( otherData.parentId === id ) {
						removeLineHelper(
							otherData.id,
							otherData.childType === TYPE_NODE ? mindmap.get(TYPE_NODE + "s").get( otherData.childId ).toJS() 
								: mindmap.get(TYPE_PIN + "s").get( otherData.childId ).toJS(),
							
							removables,
							copiesForUpdate
						);
					}
					else {
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
		
		//dispatch( removeObjects( removables, copiesForUpdate ) );
    };
}

export function tryUpdateObjects( data ) {
	return function ( dispatch, getState ) {
        const { mindmap } = getState();

        const boardID = mindmap.get( "boardID" );
        
		if ( !boardID  || !data || !data.length ) {
            return;
        }
		
		var dataCopies = [ ];
		for( var i = 0; i < data.length; ++i ) {
			var dataCopy = { };
			Object.assign(
				dataCopy,
				{
					id : data[ i ].id,
					primaryType : data[ i ].primaryType,
					x : data[ i ].x || (data[ i ].x === 0 ? 0 : null),
					y : data[ i ].y || (data[ i ].y === 0 ? 0 : null),
					lines : data[ i ].lines || null,
					title : data[ i ].title || null,
					imgURL : data[ i ].imgURL || null,
					customColor : data[ i ].customColor || null,
					type : data[ i ].type || null,
					parentType : data[ i ].parentType || null,
					parentId : data[ i ].parentId || null,
					childType : data[ i ].childType || null,
					childId : data[ i ].childId || null,
				}
			);
			dataCopies.push( dataCopy );
		}
		dispatch( updateObjects( dataCopies ) );
        backendAdapter.updateObjects( boardID, dataCopies );
    };
}

export function tryUpdateObject(object) {
	if (object.toJS) {
		object = object.toJS();
	}
	return tryUpdateObjects([object]);
}

export function updateBoard( data ) {
    return { type: UPDATE_BOARD, data };
}

export function updateObject( data ) {
    return { type: UPDATE_OBJECT, data };
}

export function updateObjects( data ) {
    return { type: UPDATE_OBJECTS, data };
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

function calcSize( obj )
{
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}

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
				lines : otherData.lines
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
		copiesForUpdate.push( otherCopy );
	}
}
