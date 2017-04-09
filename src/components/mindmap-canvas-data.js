import {
	TYPE_CLUSTER 
} from "../constants/types";

import {
	MINDMAP_NODE_RADIUS	
} from "../constants/config";

export function createViewModel() {
	var _nodes = new Map( ),
		_parentClusters = new Map( ),
		_childClusters = new Map( ),
		_dirtyParentClusters = new Map( ),
		_dirtyChildClusters = new Map( );
		
		
	// Jos luodaan puuhun uusi lehti, viimeinen lehti merkataan likaiseksi...
	
	function defaultCluster( id, anchor ) {
		return {
			id : id,
			primaryType: TYPE_CLUSTER,
			anchor: Object.assign( {}, anchor ),
			hull: [ ],
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
		_clusters.forEach( ( cluster ) => {
			if( Bounds.overlaps( cluster.bounds, node.body.bounds ) ) {
				for( var i = 0; i < cellBodies.length; ++i ) {
					if( Bounds.overlaps( cellBodies[ i ].bounds, node.body.bounds ) ) {
						insertNodeToCluster( cluster, node );
					}
				}
			}
		} );
	}
	
	function insertNodeToCluster( cluster, node ) {
		cluster.bodies.push( node );
	}
	
	
	
	function tryInsertClusterToClusters( child ) {
		var inserted = false;
		for( parent of _childClusters ) {
			if( child.id !== parent.id ) {
				if( Bounds.overlaps( parent.bounds, child.bounds ) ) {
					insertClusterToCluster( parent, child );
					inserted = true;
					break;
				}
			}
		}
		
		if( !inserted ) {
			for( parent of _parentClusters ) {
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
		parent
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
				for( ; j < cluster.cellBodies[ i ].vertices.length; ++j ) {
					vertices.push( cluster.cellBodies[ i ].vertices[ j ] );
				}
			}
			
			for( i = 0; i < cluster.bodies.length; ++i ) {
				for( j = 0; j < cluster.bodies[ i ].vertices.length; ++j ) {
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
			
			var cluster = _clusters.get( newNode.clusterId );
			
			// Cluster exists in the state of view?
			if( cluster ) {
				
				// The cluster exists, therefore we just insert the node to the cluster...
				insertNodeToCluster( cluster, node );
			} else {
				
				// The cluster does not exist, therefore we have to create the cluster with default settings...
				cluster = createDefaultCluster( newNode.id, newNode.anchor );
				insertNodeToCluster( cluster, newNode );
			}
		} else {
			tryInsertNodeToClusters( node ); 
		}
	}

	function updateNode( oldNode, newNode ) {
		
	}

	function deleteNode( oldNode ) {
		
	}

	function addCluster( newCluster ) {
		
	}
	
	function updateCluster( oldCluster, newCluster ) {
		
	}
	
	function deleteCluster( oldCluster ) {
		
	}
	
	
	
	
	
	
	
	
	
	return {
		mergeImmutableClusters,
		mergeImmutableNodes//,
		
		// addNode,
		// updateNode,
		// deleteNode,
		
		// addCluster,
		// updateCluster,
		// deleteCluster
	};
}