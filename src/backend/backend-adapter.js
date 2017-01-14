import firebase from "firebase";
let _storeAdapter = null;

// TODO: Start using chained promises for error handling on multi database call operations: https://firebase.googleblog.com/2016/01/keeping-our-promises-and-callbacks_76.html
// TODO: Start using context with listeners in order to separate the listeners from each other, because currently boardlist and board views use the same listener...
import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT,
	TYPE_NODE,
	TYPE_LINE,
	TYPE_NONE,
	TYPE_PIN
} from "../constants/types";


/** JUST FOR DEBUGGING HERE **/
function logUserData(user) {
	if (user != null) {
		
	//Get a user"s profile
	console.log("Printing all user information below:");
	console.log("	Firebase project-specific UID: "+user.uid);
	console.log("	Name: "+user.displayName);
	console.log("	Email: "+user.email);
	console.log("	Photo URL: "+user.photoURL);

    //Get a user"s provider-specific profile information
	user.providerData.forEach(function (profile) {
    console.log("	Sign-in provider: "+profile.providerId);
    console.log("  		Provider-specific UID: "+profile.uid);
    console.log("  		Name: "+profile.displayName);
    console.log("  		Email: "+profile.email);
    console.log("  		Photo URL: "+profile.photoURL);
	});
	}  else {
		console.warn("Printing user information failed due invalid currentUser.");
	}
}
/** DEBUGGING END HERE **/


/** Lataa taustapalvelimet **/
export function init(storeAdapter) {
	// TODO: load config from file...
    var config = {
        apiKey: "AIzaSyBbKd7Hy_x2niFQ6LQz6S1KnTFXOuDeq4k",
        authDomain: "aivotest-9df12.firebaseapp.com",
        databaseURL: "https://aivotest-9df12.firebaseio.com",
        storageBucket: "aivotest-9df12.appspot.com",
        messagingSenderId: "400034027019"
    };
    firebase.initializeApp(config);
    _storeAdapter = storeAdapter;
	
	//loadDefaultBoard();
}


// Load default board still to be implemented in some future?
/** Lataa vakiotaulun palvelimelta **/
/** Esiehto: init on kutsuttu ja käyttäjä ei ole kirjautunut sisään **/
/** Jälkiehto: Puskee vakiotaulun sisällön käyttöliittymälle kutsumalla sovittimen kautta tarvittavia funktioita. **/
function loadDefaultBoard() {
	
	// Luetaan tieto kerran:
	var ref = firebase.database().ref("boards/default/");
	ref.once("value", function(snapshot) {
		snapshot.forEach(function(keySnapshot) {
			var key = keySnapshot.key();
			console.log("boards/default/"+key);
			if(key === "meta") {
				//_storeAdapter.updateBoard("default", keySnapshot.data().val();
			}
			else if(key == "nodes") {
				// TODO: Loop keys and their content
				//_storeAdapter.updateNode(nodeId, nodeData);
			}
		});
	});
}

function createUserData(sessionId, user) {
	return {
			sessionId: sessionId,
			userId: user.uid,
			displayName: user.displayName,
			email: user.email,
			emailVerified: user.emailVerified,
			photoURL: user.photoURL,
	}
}


function attachAuthChangedListener() {
	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		//logUserData(user);
		//_storeAdapter.userSignedIn(createUserData("default", user));
	} else {
		// No user is signed in.
		console.log("Currently no user is signed in.");
		_storeAdapter.userSignedOut();
		//detachBoardListeners();
	}
	});
}

// A function that creates the home board after user has signed up...
// or user try to open home board, but it does not exist.
function createHomeBoard() {
	console.log("Trying to create home board");
	const userId = firebase.auth().currentUser.uid;
	const parentId = firebase.database().ref("nodes").push().key;
	const childId = firebase.database().ref("nodes").push().key;
	const boardId = firebase.database().ref("boards").push().key;
	const parentX = 500;
	const parentY = 250;
	const childX = 500;
	const childY = 1000;
	const lineId = firebase.database().ref("/boards/" + boardId + "/lines/").push().key;
	const lineIdToPin = firebase.database().ref("/boards/" + boardId + "/lines/").push().key;
	const pinId = firebase.database().ref("/boards/" + boardId + "/pins/").push().key;
	
	let updates = {};
	
	updates["/boards/" + boardId + "/meta"] = {
		parentBoard: boardId, // Recursively is parent of itself, as is home/root...
		title: "home",
		imgURL: "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons/blue-jelly-icons-business/078551-blue-jelly-icon-business-home4.png",
		stars: 0,
		followers: 0
	};
	
	var parentLineData = {}; 
	parentLineData[lineId] = lineId;
	
	updates["/boards/" + boardId + "/nodes/" + parentId] = {
		title: "parent example",
		primaryType : TYPE_NODE,
		id : parentId,
		type: NODE_TYPE_UNDEFINED,
		imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
		x: parentX,
		y: parentY,
		lines: parentLineData
	};

	// updates["/boards/" + boardId + "/nodes/" + parentId + "/lines/"] = {
		// [lineId] : lineId
	// };
	
	updates["/nodes/" + parentId] = {
		title: "parent example",
		owner: userId,
		stars: 0,
		followers: 0
	};

	var childLineData = {}; 
	childLineData[lineId] = lineId;
	updates["/boards/" + boardId + "/nodes/" + childId] = {
		title: "child example",
		primaryType : TYPE_NODE,
		id : childId,
		type: NODE_TYPE_UNDEFINED,
		imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
		x: childX,
		y: childY,
		lines: childLineData
	};

	
	// updates["/boards/" + boardId + "/nodes/" + childId + "/lines/"] = {
		// [lineId] : lineId
	// };
	
	updates["/nodes/" + childId] = {
		title: "child example",
		owner: userId,
		stars: 0,
		followers: 0
	};
	
	//updates["/users/" + userId + "/nodes/" + parentId] = true;
	//updates["/users/" + userId + "/nodes/" + childId] = true;
	updates["/users/" + userId + "/home"] = boardId;
	updates["/users/"+ userId + "/boards/" + boardId] = true;
	
	updates["/boards/" + boardId + "/lines/" + lineId] = {
		primaryType : TYPE_LINE,
		id : lineId,
		parentType: "node",
		parentId: parentId,
		childType: "node",
		childId: childId
    };
	
	var pinLineData = {}; 
	pinLineData[lineIdToPin] = lineIdToPin;
	updates["/boards/" + boardId + "/pins/" + pinId] = {
		primaryType : TYPE_PIN, 
		id : pinId,
		x: 800,
		y: 800,
		lines: pinLineData
	};	

	// updates["/boards/" + boardId + "/pins/" + pinId + "/lines/"] = {
		// [lineIdToPin] : lineIdToPin
	// };
	
	updates["/boards/" + boardId + "/lines/" + lineIdToPin] = {
		primaryType : TYPE_LINE,
		id : lineIdToPin,
		parentType: "node",
		parentId: parentId,
		childType: "pin",
		childId: pinId
	};
	
	firebase.database().ref().update(
		updates, 
		function(error) {
			if(error) {
				console.warn(error);
				_storeAdapter.error(error.code);
			} else {
				console.log("Home board " + boardId + " created succesfully");
			}
		}
	);
}

// Is called after user has signed in....
// if home board does not exist, createHomeBoard function is called once...
export function openHomeBoard() {
	console.log("Trying to open home board...");
	firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/home").once("value").then(
		function(snapshot) {
		
				const boardId = snapshot.val();
				
				if(boardId) {
					console.log("Homeboards id is: " + boardId);
					openBoard(boardId);
				} else {
					console.warn("Home board does not exist, trying to create one...");
					createHomeBoard();
				}
		},
		function(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		}
	);
}

/** Uuden käyttäjätilin luominen ja kirjautuminen sisään **/
/** Parametreina välitetään sähköposti-osoite ja salasana **/
/** Esiehto: init on kutsuttu ja käyttäjä ei ole kirjautunut sisään. **/
/** Jälkiehto: Puskee virheen sattuessa tunnisteen käyttöliittymälle kutsumalla sovittimen kautta tarvittavaa funktiota. **/
/** 		   Virheettömässä tilanteessa puskee muokatun vakiotaulun sisällön käyttöliittymälle kutsumalla sovittimen kautta tarvittavia funktioita. **/
export function createUserWithEmailAndSignIn(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(
	function(user) {
		let sessionId = firebase.database().ref("sessions").push().key;
		createHomeBoard();
		_storeAdapter.userSignedIn(createUserData(sessionId, user));
		attachAuthChangedListener();
	},
	function(error) {
		console.warn(error);
		_storeAdapter.error(error);
	});
}

/** Kirjautuminen sisään **/
/** Parametreina välitetään sähköposti-osoite ja salasana, sekä ladattavan taulun id ja mahdollinen dialogissa auki oleva node... **/
/** Esiehto: init on kutsuttu ja käyttäjä ei ole kirjautunut sisään. **/
/** Jälkiehto: Puskee viimeisimmän taulun sisällön käyttäjälle **/
/**            tai tulevaisuudessa voidaan istuntotunnuksen perusteella palauttaa edellinen istunto... **/
/**            Virhetilanteessa palauttaa virhetunnisteen käyttöliittymälle kutsumalla sovittimen kautta sopivaa funktiota **/
export function signInWithEmail(email, password, sessionId = null) {	
	firebase.auth().signInWithEmailAndPassword(email, password).then(
	function(user) {
		firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/home").once("value").then(
			function(snapshot) {
				if(!snapshot.val()) {
					createHomeBoard();
				}
			}
		);
		if(!sessionId) {
			sessionId = firebase.database().ref("sessions").push().key;
		}
		_storeAdapter.userSignedIn(createUserData(sessionId, user));
		attachAuthChangedListener();
	},
	function(error) {
        console.warn(error);
		_storeAdapter.error(error.code);
    });
}


/**
	Esishto: Kirjautuminen suoritettu
	Jälkiehto: Avaa uuden taulun tai kutsuu virhefunktioo.
**/
export function createBoard(boardData, boardId = null) {
	console.log("Trying to create board");
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	
	if(!boardId) { 
		boardId = firebase.database().ref().child("boards").push().key;
	}
	
	firebase.database().ref("boards/"+boardId+"/meta").update(boardData, function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		} else {
			firebase.database().ref("users/"+user.uid+"/boards/").child(boardId).set(
				true, 
				function(error) {
					if(error) {
						console.warn(error);
						_storeAdapter.error(error);
					}
					else {
						console.log("Board " + boardId + " created succesfully");
					}
				}
			);
		}
	});
}

export function removeBoard(boardId) {
	firebase.database().ref("boards/"+boardId).remove();
	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/boards/"+boardId).remove();
}


export function openBoard(boardId, sessionId) {
	console.log("Trying to open board: " + boardId);
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	
	var updates = {};
	updates["/sessions/"+sessionId] = {
		userId: user.uid,
		boardId: boardId,
		startedAt: firebase.database.ServerValue.TIMESTAMP
	};
	firebase.database().ref().update(updates, function(error){
		if(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		}
		else {
			attachBoardListeners(boardId);
		}
	});
}

export function openNode(nodeId, sessionId, boardId) {
	console.log("Trying to open node: " + nodeId);
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	
	var updates = {};
	updates["/sessions/"+sessionId] = {
		userId: user.uid,
		nodeId: nodeId,
		boardId: boardId,
		startedAt: firebase.database.ServerValue.TIMESTAMP
	};
	firebase.database().ref().update(updates, function(error){
		if(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		}
		else {
			attachNodeListeners(nodeId);
		}
	});
}

export function closeBoard(boardId) {
	detachBoardListeners(boardId);
}

export function closeNode(nodeId) {
	detachNodeListeners(nodeId);
}




const B_FAKE_CONTEXT = new Object();
const B_META_VALUE = function(boardId) 
{
	return function(data) {
		_storeAdapter.updateBoard(boardId, data.val());
	}
}

function attachBoardListeners(boardId) {
	var metaRef = firebase.database().ref("boards/"+boardId+"/meta");
	
	metaRef.on(
		"value", 
		B_META_VALUE(boardId),
		B_FAKE_CONTEXT
	);

	var nodesRef = firebase.database().ref("boards/" + boardId + "/nodes");
	
	nodesRef.on("child_added", function(data) {
		_storeAdapter.updateNode(data.key, data.val());
	});
	
	nodesRef.on("child_changed", function(data) {
		_storeAdapter.updateNode(data.key, data.val());
	});
	
	nodesRef.on("child_removed", function(data) {
		_storeAdapter.removeNode(data.key, data.val());
	});

	var pinsRef = firebase.database().ref("boards/" + boardId + "/pins");
	
	pinsRef.on("child_added", function(data) {
		_storeAdapter.updatePin(data.key, data.val());
	});
	
	pinsRef.on("child_changed", function(data) {
		_storeAdapter.updatePin(data.key, data.val());
	});
	
	pinsRef.on("child_removed", function(data) {
		_storeAdapter.removePin(data.key, data.val());
	});
	
	var linesRef = firebase.database().ref("boards/" + boardId + "/lines");
	
	linesRef.on("child_added", function(data) {
		_storeAdapter.updateLine(data.key, data.val());
	});
	
	linesRef.on("child_changed", function(data) {
		_storeAdapter.updateLine(data.key, data.val());
	});
	
	linesRef.on("child_removed", function(data) {
		_storeAdapter.removeLine(data.key, data.val());
	});
}

export function detachBoardListeners(boardId) {
	firebase.database().ref("boards/"+boardId+"/lines").off();
	firebase.database().ref("boards/"+boardId+"/nodes").off();
	firebase.database().ref("boards/"+boardId+"/pins").off();
	firebase.database().ref("boards/"+boardId+"/meta").off(
		"value",
		B_META_VALUE,
		B_FAKE_CONTEXT
	);
}


const L_FAKE_CONTEXT = new Object();
const L_META_VALUE = function(boardId)
{
	return function(data) {
		_storeAdapter.updateListItem(boardId, data.val());
	}
}

const L_BOARD_ADDED = function(data) 
{
	const boardId = data.key;
	console.log(boardId);
	let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
	metaRef.on(
		"value",
		L_META_VALUE(boardId),
		L_FAKE_CONTEXT // Fake context as id.
	);
}
const L_BOARD_REMOVED = function(data) 
{
	const boardId = data.key;
	console.log(boardId);
	let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
	metaRef.off(
		"value",
		L_META_VALUE(boardId),
		L_FAKE_CONTEXT
	);
	_storeAdapter.removeListItem(boardId);
}

export function openBoardList() {
	var userBoardsRef = firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/boards");
	userBoardsRef.on(
		"child_added",
		L_BOARD_ADDED,
		L_FAKE_CONTEXT // Fake context as id.
	);
	userBoardsRef.on(
		"child_removed",
		L_BOARD_REMOVED,
		L_FAKE_CONTEXT // Fake context as id.
	);
}

export function closeBoardList() {
	var userBoardsRef = firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/boards");
	ref.once("value", function(snapshot) {
		snapshot.forEach(function(keySnapshot) {
			const boardId = keySnapshot.key;
			let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
			metaRef.off(
				"value",
				L_META_VALUE(boardId),
				L_FAKE_CONTEXT // Fake context as id.
			);
		});
	});
	userBoardsRef.off(
		"child_added",
		L_BOARD_ADDED,
		L_FAKE_CONTEXT
	);
	userBoardsRef.off(
		"child_removed",
		L_BOARD_REMOVED,
		L_FAKE_CONTEXT
	);
}



export function signOut() {
    firebase.auth().signOut();
}


export function createObject(
	boardId,
	object,
	parent = null
) {
	if( !object.id ) {
		object.id = firebase.database( BOARD_PATH + primaryType + "s/" ).push().key;
	}

	var updates = { };
	var line = null;
	const BOARD_PATH = "/boards/" + boardId + "/";
	
	if( parent && validateObject( parent ) ) {
				
		line = {
			primaryType : TYPE_LINE,
			id : firebase.database( BOARD_PATH + TYPE_LINE + "s/" ).push().key,
			parentType : parent.primaryType,
			parentId : parent.id,
			childType : object.type,
			childId : object.id
		};
		
		updates[ BOARD_PATH + TYPE_LINE + "s/" + line.id ] = line;
		
		object.lines = {
			[ line.id ] : line.id
		};
		
		updates[ BOARD_PATH + parent.primaryType+ "s/" + parent.id + "/" + TYPE_LINE + "s/" + line.id ] = line.id;
	}
	else if ( parent ) {
		return;
	}
	
	updates[ BOARD_PATH + object.primaryType + "s/" + object.id ] = object;
	
	// TODO: Implement
	//_storeAdapter.createObject( object, parent, line );
	
	firebase.database().update( updates ).then(
		() => {
			console.log( "Successfully updated " + updates.toString() );
		},
		
		error => {
			console.warn( error );
			_storeAdapter.error( error.id );
		}
	);
}


export function removeObject(
	boardId,
	object,
	lineMap
) {
	var updates = { };
	const BOARD_PATH = "/boards/" + boardId + "/";
	var primaryType = object.primaryType;
	var id = object.id;
	var lines = object.lines;
	
	if( primaryType === TYPE_NODE || primaryType === TYPE_PIN ) {
		
		if( lines ) {
		
			for( lineId in lines ) {
			
				var lineData = lineMap[ lineId ];
				var otherId;
				var otherType;
				
				if( lineData.parentId === id ) {
					otherId = lineData.childId;
					otherType = lineData.childType;
				} 
				else {
					otherId = lineData.parentId;
					otherType = lineData.parentType;
				}
				
				updates[ BOARD_PATH + otherType + "s/" + otherId + "/" + TYPE_LINE + "s/" + lineId ] = null;
				updates[ BOARD_PATH + TYPE_LINE + "s/" + lineId ] = null;
			}
		}
	}
	else if( primaryType === TYPE_LINE ) {
		updates[ BOARD_PATH + object.parentType + "s/" + object.parentId + "/" + TYPE_LINE + "s/" + id ] = null;
		updates[ BOARD_PATH + object.childType + "s/" + object.childId + "/" + TYPE_LINE + "s/" + id ] = null;
	}
	else {
		console.warn( "primaryType is unknown" );
		return;
	}
	
	updates[ BOARD_PATH + primaryType + "s/" + id ] = null;
	
	firebase.database().update( updates ).then(
		() => {
			console.log( "Successfully updated " + updates.toString() );
			
			// TODO: implement?
			// _storeAdapter.removeObject( object, lineMap ); 
		},
		
		error => {
			console.warn(error);
			_storeAdapter.error(error.id);
		}
	);
}



export function moveObject(
	boardId,
	object
) {
	const PATH = "/boards/" + boardId + "/" + object.primaryType + "s/" + object.id;
	
	var updates = { };
	updates[ "/x" ] = object.x;
	updates[ "/y" ] = object.y;
	firebase.database( PATH ).update(
		updates
	).then(
		() => {
			console.log( "Successfully updated " + updates.toString() );
			// TODO: Implement?
			//_storeAdapter.moveObject( object ); 
		},
		
		error => {
			console.warn(error);
			_storeAdapter.error(error.id);
		}
	);
}













function validateObject(object) {
	return (
		object.primaryType &&
		object.id &&
		( 	
			(
				(	
					object.primaryType === TYPE_NODE ||
					object.primaryType === TYPE_PIN
				) &&
				typeof object.x === "number" &&
				typeof object.y === "number"
			) ||
			(
				object.primaryType === TYPE_LINE &&
				object.parentId &&
				object.parentType &&
				(
					object.parentType === TYPE_NODE ||
					object.parentType === TYPE_PIN
				) &&
				object.childType &&
				(
					object.childType === TYPE_NODE ||
					object.childType === TYPE_PIN
				)
			)
		)
	)	
}
