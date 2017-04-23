import {
	TYPE_CLUSTER,
	TYPE_NODE
} from "../constants/types";

import {
	MINDMAP_NODE_RADIUS	
} from "../constants/config";

import firebase from "firebase";


export function Presenter( currentBoardId ) {

	var	_currentBoardId = currentBoardId,
		_selectedObject = null,

		 _nodes = new Map( ),
		_parentClusters = new Map( ),
		_childClusters = new Map( ),
		
		// For updating hulls
		_dirtyParentClusters = new Map( ),
		_dirtyChildClusters = new Map( ),
		
	
		// For updating firebase
		_dirtyNodes = new Map( ),
		_dirtyClusters = new Map( );

	function updateSelection( object = null ) {
		if( _selectedObject !== object ) {
			if( _selectedObject ) {
				_selectedObject.isSelected = false;
				if( _selectedObject.primaryType === TYPE_CLUSTER ) {
					_dirtyClusters.set( _selectedObject.id, _selectedObject );
				} else if ( _selectedObject.primaryType === TYPE_NODE ) {
					_dirtyNodes.set( _selectedObject.id, _selectedObject );
				}
			}

			_selectedObject = object;

			if( _selectedObject ) {
				_selectedObject.isSelected = true;
				
				if( _selectedObject.primaryType === TYPE_CLUSTER ) {
					_dirtyClusters.set( _selectedObject.id, _selectedObject );
				} else if ( _selectedObject.primaryType === TYPE_NODE ) {
					_dirtyNodes.set( _selectedObject.id, _selectedObject );
				}
			}
		}
	}
	
	function UserInput( ) {
		
		function trySelectObject( point ) {
			var object = trySelectNode( point );
			if( !object ) {
				object = trySelectCluster( point );
			}
			
			return object;
		}
		
		function trySelectNode( point ) {
			for( var node of _nodes ) {
				node = node[ 1 ];

				if( Bounds.contains( node.body.bounds, point ) && Vertices.contains( node.body.vertices, point ) ) {
					updateSelection( node );
					return {
						primaryType : node.primaryType,
						id : node.id
					};
				}
			}
			updateSelection( null );
			return null;
		}

		function trySelectCluster( point ) {
			var cluster = null;
			for( cluster of _childClusters ) {
				cluster = cluster[ 1 ];

				if( Bounds.contains( cluster.bounds, point ) && Vertices.contains( cluster.hull, point ) ) {
					updateSelection( cluster );
					return {
						primaryType : cluster.primaryType,
						id : cluster.id
					};
				}
			}

			for( cluster of _parentClusters ) {
				cluster = cluster[ 1 ];

				if( Bounds.contains( cluster.bounds, point ) && Vertices.contains( cluster.hull, point ) ) {
					updateSelection( cluster );
					return {
						primaryType : cluster.primaryType,
						id : cluster.id
					};
				}
			}
			updateSelection( null );
			return null;
		}

		function tryMoveObject( object, delta ) {
			const id = object.id;
			switch( object.primaryType ) {
				case TYPE_CLUSTER :
						object = _parentClusters.get( id );
						if( !object ) {
							object = _childClusters.get( id );
						}
						if( object ) {
							object = tryMoveCluster( object, delta );
						}
						break;
				case TYPE_NODE :
						object = _nodes.get( id );
						if( object ) {
							object = tryMoveNode( object, delta );
						}
						break;
				default:
						object = null;
						break;
			};
			
			return object;
		}
		
		function tryMoveNode( node, delta ) {
			Body.translate( node.body, delta );
		}

		function tryMoveCluster( cluster, delta ) {
			var i = 0;
			
			for( ; i < cluster.bodies.length; ++i ) {
				Body.translate( cluster.bodies[ i ], delta );
			}

			for( i = 0; i < cluster.cellBodies.length; ++i ) {
				Body.translate( cluster.cellBodies[ i ], delta );
			}

			cluster.x -= delta.x;
			cluster.y -= delta.y;

			Vertices.translate( cluster.hull, delta );
		}
		
		
		return {
			trySelectObject,
			tryMoveObject
		};
	};
		
	// Jos luodaan puuhun uusi lehti, viimeinen lehti merkataan likaiseksi...
	
	function defaultCluster( id, anchor ) {
		return {
			id : id,
			primaryType: TYPE_CLUSTER,
			anchor: Object.assign( { }, anchor ),
			hull : [ ],
			parent : null,
			children : [ ],
			cellBodies : [
				// first in the top-left
				Bodies.circle( 
					anchor.x, 
					anchor.y, 
					MINDMAP_NODE_RADIUS, 
					{
						frictionAir: 1,
						mass: 5
					} 
				),
				// second in the center-right
				Bodies.circle( 
					anchor.x, 
					anchor.y, 
					MINDMAP_NODE_RADIUS, 
					{
						frictionAir: 1,
						mass: 5
					} 
				),

				// third in the bottom
				Bodies.circle( 
					anchor.x, 
					anchor.y, 
					MINDMAP_NODE_RADIUS, 
					{
						frictionAir: 1,
						mass: 5
					} 
				)
			],
			bodies : [ ]
		}
	}

	function tryInsertNodeToClusters( node ) {
		var inserted = false,
			parent = null;
		
		for( parent of _childClusters ) {
			parent = parent[ 1 ];
			
			if( Bounds.overlaps( parent.bounds, node.bounds ) ) {
				insertNodeToCluster( parent, node );
				inserted = true;
				break;
			}
		}
		
		if( !inserted ) {
			for( parent of _parentClusters ) {
				parent = parent[ 1 ];
				
				if( Bounds.overlaps( parent.bounds, node.bounds ) ) {
					insertNodeToCluster( parent, node );
					inserted = true;
					break;
				}
			}
		}
	}
	
	function insertNodeToCluster( cluster, node ) {
		cluster.bodies.push( node.body );
		
		if( cluster.parent ) {
			_dirtyParentClusters.set( cluster.parent, _parentClusters.get( cluster.parent ) );
			_dirtyChildClusters.set( cluster.id, cluster );
		}
		else {
			_dirtyParentClusters.set( cluster.id, cluster );
		}
	}

	function deleteNodeFromCluster( cluster, node ) {
		var filtered = [ ];
		for( var i = 0; i < cluster.bodies.length; ++i ) {
			if( cluster.bodies[ i ].id !== node.body.id ) {
				filtered.push( cluster.bodies[ i ] );
			}
		}
		cluster.bodies = filtered;
		if( cluster.parent ) {
			_dirtyParentClusters.set( cluster.parent, _parentClusters.get( cluster.parent ) );
			_dirtyChildClusters.set( cluster.id, cluster );
		} else {
			_dirtyParentClusters.set( cluster.id, cluster );
		}
	}
	
	
	function tryInsertClusterToClusters( child ) {
		var inserted = false,
			parent = null;
		// for( parent of _childClusters ) {
		// 	if( child.id !== parent.id ) {
		// 		if( Bounds.overlaps( parent.bounds, child.bounds ) ) {
		// 			insertClusterToCluster( parent, child );
		// 			inserted = true;
		// 			break;
		// 		}
		// 	}
		// }
		
		if( !inserted ) {
			for( parent of _parentClusters ) {
				parent = parent[ 1 ];
				
				if( child.id !== parent.id ) {
					if( Bounds.overlaps( parent.bounds, child.bounds ) ) {
						insertClusterToCluster( parent, child );
						inserted = true;
						break;
					}
				}
			}
		}
	}
	
	function insertClusterToCluster( parent, child ) {
		_parent.children.push( child );
		_dirtyParentClusters.set( parent.id, parent );
		_dirtyChildClusters.set( child.id, child );
		if(_parentClusters.has( child.id ) ) {
			_parentClusters.delete( child.id );
		}
	}

	function deleteClusterFromCluster( parent, child ) {
		var filtered = [ ];
		
		for( var i = 0; i < parent.children.length; ++i ) {
			if( parent.children[ i ].id !== child.id ) {
				filtered.push( parent.children[ i ] );
			}
		}
		
		parent.children = filtered;
		_dirtyParentClusters.set( parent.id, parent );
	}
	
	function updateDirtyHulls( ) {
		updateHulls( _dirtyChildClusters );
		updateHulls( _dirtyParentClusters );
	}
	
	function updateHulls( clusters ) {
		clusters.forEach( ( cluster ) => {
			var vertices = [ ],
				i = 0,
				j = 0;
			
			for( ; i < cluster.cellBodies.length; ++i ) {
				for( ; j < cluster.cellBodies[ i ].vertices.length; j += 2 ) {
					vertices.push( cluster.cellBodies[ i ].vertices[ j ] );
				}
			}
			
			for( i = 0; i < cluster.bodies.length; ++i ) {
				for( j = 0; j < cluster.bodies[ i ].vertices.length; j += 2 ) {
					vertices.push( cluster.bodies[ i ].vertices[ j ] );
				}
			}
			
			cluster.hull = Vertices.hull( vertices );
			cluster.bounds = Bounds.create( cluster.hull );
		} );
	}
	
	
	
	
	function mergeImmutableNodes( immutableNodes ) {
		var node = null,
			immutableNode = null;
			
		// Go through possible changes to the state of view...
		for( node of _nodes ) {
			
			node = node[ 1 ];
			
			// Check, if the node still exists in the immutable state...
			immutableNode = immutableNodes.get( node.id );
			
			// The node exists...
			if( immutableNode ) {
				
				// Update the state of view based on the node's changes...
				updateNode( node, immutableNode.toJS( ) );
				
				// The immutable node is now in the state of view,
				// therefore the node must be removed from the copy of immutable state...
				immutableNodes.delete( node.id );
			} 
			
			// The node does not exist anymore in the immutable state...
			else {
				
				// Remove the node from the state of view...
				deleteNode( node );
			}
		}
		
		// These nodes exists only in the immutable state...
		immutableNodes.forEach( ( immutableNode ) => {
			
			// Add new node to the view state...
			addNode( immutableNode.toJS( ) );
		} );
	}

	
	function mergeImmutableClusters( immutableClusters ) {
		var cluster = null,
			immutableCluster = null;
			
		// Go through possible changes to the state of view...
		for( cluster of _clusters ) {
			
			cluster = cluster[ 1 ];
			
			// Check, if the cluster still exists in the immutable state...
			immutableCluster = immutableCluster.get( cluster.id );
			
			// The cluster exists...
			if( immutableCluster ) {
				
				// Update the state of view based on the cluster's changes...
				updateCluster( cluster, immutableCluster.toJS( ) );
				
				// The immutable cluster is now in the state of view,
				// therefore the cluster must be removed from the copy of immutable state...
				immutableClusters.delete( cluster.id );
			} 
			
			// The cluster does not exist anymore in the immutable state...
			else {
				
				// Remove the cluster from the state of view...
				deleteCluster( cluster );
			}
		}
		
		// These clusters exists only in the immutable state...
		immutableClusters.forEach( ( immutableCluster ) => {
			
			// Add new cluster to the view state...
			addCluster( immutableCluster.toJS( ) );
		} );
	}
	
	
	
	
	// The functions below can be called from Firebase module or by using immutable state merging functions...

	function addNode( newNode ) {
		
		if( !newNode.anchor ) {
			newNode.anchor = {
				x: newNode.x,
				y: newNode.y
			}
		}
		
		// Create Matter-JS body for the node...
		newNode.body = Bodies.circle( 
			anchor.x, 
			anchor.y, 
			newNode.radius || MINDMAP_NODE_RADIUS, 
			{
				frictionAir: 1,
				mass: 5
			}
		);
		
		// New node belongs to cluster?
		if( newNode.clusterId ) {

			var cluster = _parentClusters.get( newNode.clusterId );
			if( !cluster ) {
				_childClusters.get( newNode.clusterId );
			}
			// Cluster exists in the state of view?
			if( cluster ) {
				
				// The cluster exists, therefore we just insert the node to the cluster...
				insertNodeToCluster( cluster, newNode );
			} else {
				
				// The cluster does not exist, therefore we have to create the cluster with default settings...
				cluster = createDefaultCluster( newNode.id, newNode.anchor );
				insertNodeToCluster( cluster, newNode );
			}
		} else if( !node.isSelected ) {
			tryInsertNodeToClusters( node );
		}

		// 0.618 kerroin lähimmästä sisempään.
		// 1 * 0.618 = 0.618;
		// 0.618 / 0.618 = 1
		// 2 * 0.618 = 1.236
		// 1.236 / 0.618 = 2; 
	}

	function updateNode( oldNode, newNode ) {
		Object.assign( oldNode, newNode );
	}

	function deleteNode( oldNode ) {
		var cluster = null;
		if( oldNode.clusterId ) {
			cluster = _parentClusters.get( oldNode.clusterId );
			if( !cluster ) {
				cluster = _childClusters.get( oldNode.clusterId );
			}
		}

		if( cluster ) {
			deleteNodeFromCluster( oldNode );
		}

		_nodes.delete( oldNode.id );
	}

	function addCluster( newCluster ) {
		var oldCluster = _parentClusters.get( newCluster.id );
	}
	
	function updateCluster( oldCluster, newCluster ) {
		if( oldCluster.x !== newCluster.x || oldCluster.y !== newCluster.y ) {
			var delta = {
				x: oldCluster.x - newCluster.x,
				y: oldCluster.y - newCluster.y
			};
			translateCluster( oldCluster, delta );
		}
		Object.assign( oldCluster, newCluster );
	}
	
	function deleteCluster( oldCluster ) {
		
		var cluster = null;
		if( oldCluster.parent ) {
			cluster = _parentClusters.get( oldNode.clusterId );
			if( !cluster ) {
				cluster = _childClusters.get( oldNode.clusterId );
			}
			if( cluster ) {
				deleteClusterFromCluster( oldCluster );
			}
			
			_childClusters.delete( oldCluster.id );
		} 
		else {
			_parentClusters.delete( oldCluster.id );
		}
	}
	
	
	
	return {
		mergeImmutableClusters,
		mergeImmutableNodes,
		UserInput
		// addNode,
		// updateNode,
		// deleteNode,
		
		// addCluster,
		// updateCluster,
		// deleteCluster
	};
}