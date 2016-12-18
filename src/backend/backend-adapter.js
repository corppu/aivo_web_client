import firebase from "firebase";
let _storeAdapter = null;

// TODO: Start using chained promises for error handling on multi database call operations: https://firebase.googleblog.com/2016/01/keeping-our-promises-and-callbacks_76.html

import {
    NODE_TYPE_UNDEFINED,
    NODE_TYPE_IMAGE,
    NODE_TYPE_TEXT
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
		logUserData(user);
		_storeAdapter.userSignedIn(createUserData("default", user));
		openHomeBoard();
	} else {
		// No user is signed in.
		console.log("Currently no user is signed in.");
		_storeAdapter.userSignedOut();
		//detachBoardListeners();
	}
	});
}

// A function that creates the home board after user has signed up...
// or user has signed in and no board exists...
export function createHomeBoard() {
	console.log("Trying to create home board");
	const userId = firebase.auth().currentUser.uid;
	const parentId = firebase.database().ref("nodes").push().key;
	const childId = firebase.database().ref("nodes").push().key;
	const boardId = firebase.database().ref("boards").push().key;
	const parentX = 500;
	const parentY = 250;
	const childX = 500;
	const childY = 1000;
	
	
	let updates = {};
	
	updates["/boards/" + boardId + "/meta"] = {
		title: "home",
		imgURL: "http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons/blue-jelly-icons-business/078551-blue-jelly-icon-business-home4.png",
		stars: 0,
		followers: 0
	};
	
	
	updates["/boards/" + boardId + "/nodes/" + parentId] = {
		title: "parent example",
		type: NODE_TYPE_UNDEFINED,
		imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
		x: parentX,
		y: parentY
	};
	
	updates["/nodes/" + parentId] = {
		title: "parent example",
		owner: userId,
		stars: 0,
		followers: 0
	};

	updates["/boards/" + boardId + "/nodes/" + childId] = {
		title: "child example",
		type: NODE_TYPE_UNDEFINED,
		imgURL: "http://xpenology.org/wp-content/themes/qaengine/img/default-thumbnail.jpg",
		x: childX,
		y: childY
	};
	
	updates["/nodes/" + childId] = {
		title: "child example",
		owner: userId,
		stars: 0,
		followers: 0
	};
	
	updates["/users/" + userId + "/nodes/" + parentId] = true;
	updates["/users/" + userId + "/nodes/" + childId] = true;
	updates["/users/" + userId + "/home"] = boardId;
	updates["/users/"+ userId + "/boards/" + boardId] = true;
	
	const lineId = firebase.database().ref("/boards/" + boardId + "/lines/").push().key;
	updates["/boards/" + boardId + "/lines/" + lineId] = {
		parentType: "node",
		parentId,
		childType: "node",
		childId,
		
		sx: parentX,
		sy: parentY,
		ex: childX,
		ey: childY,
		cp1x: 500,
		cp1y: 500, 
		cp2x: 500, 
		cp2y: 750,
		
		title: "insert verb"
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
 
export function openHomeBoard() {
	console.log("Trying to open home board...");
	firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/home").once("value").then(
		function(snapshot) {
		console.log("SNAPSHOT");
			if(snapshot) {
				console.log("SNAPSHOT IS: " + snapshot);
				const boardId = snapshot.val();
				console.log(boardId);
				if(boardId) {
					console.log(boardId);
					openBoard(boardId);
				} else {
					console.warn("Home board does not exist, trieing to create one...");
					createHomeBoard();
				}
			} else {
				console.warn("Home board does not exist, trieing to create one...");
				createHomeBoard();
				//_storeAdapter.error(dataDoesNotExistCode)
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

function presenceMachine() {
	// since I can connect from multiple devices or browser tabs, we store each connection instance separately
	// any time that connectionsRef"s value is null (i.e. has no children) I am offline
	var myConnectionsRef = firebase.database().ref("users/"+_currentUserId+"/connections");

	// stores the timestamp of my last disconnect (the last time I was seen online)
	var lastOnlineRef = firebase.database().ref("users/"+_currentUserId+"/lastOnline");

	var connectedRef = firebase.database().ref(".info/connected");
	connectedRef.on("value", function(snap) {
	if (snap.val() === true) {
    // We"re connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

    // add this device to my connections list
    // this value could contain info about the device or a timestamp too
    var con = myConnectionsRef.push(true);

    // when I disconnect, remove this device
    con.onDisconnect().remove();

    // when I disconnect, update the last time I was seen online
	lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
	}
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
		boardId: boardId
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
		boardId: boardId
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

function attachBoardListeners(boardId) {
	var metaRef = firebase.database().ref("boards/"+boardId+"/meta");
	
	metaRef.on("value", function(data) {
		_storeAdapter.updateBoard(boardId, data.val());
	});

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
	
	var linesRef = firebase.database().ref("boards/" + boardId + "/lines");
	
	linesRef.on("child_added", function(data) {
		_storeAdapter.updateLine(data.key, data.val());
	});
	
	linesRef.on("child_changed", function(data) {
		_storeAdapter.updateLine(data.key, data.val());
	});
	
	nodesRef.on("child_removed", function(data) {
		_storeAdapter.removeLine(data.key, data.val());
	});
	
}

export function openBoardList() {
	var userBoardsRef = firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/boards");
	userBoardsRef.on("child_added", function(data) {
		const boardId = data.key;
		let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
		metaRef.on("value", function(data) {
			_storeAdapter.updateListItem(boardId, data.val());
		});
	});
	userBoardsRef.on("child_removed", function(data) {
		const boardId = data.key;
		let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
		metaRef.off();
		_storeAdapter.removeListItem(boardId);
	});	
}

export function closeBoardList() {
	var userBoardsRef = firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/boards");
	ref.once("value", function(snapshot) {
		snapshot.forEach(function(keySnapshot) {
			const boardId = keySnapshot.key;
			let metaRef = firebase.database().ref("boards/"+boardId+"/meta");
			metaRef.off();
		});
	});
	userBoardsRef.off();
}

export function detachBoardListeners(boardId) {
	firebase.database().ref("boards/"+boardId+"/lines").off();
	firebase.database().ref("boards/"+boardId+"/nodes").off();
	firebase.database().ref("boards/"+boardId+"/meta").off();
}

export function signOut() {
    firebase.auth().signOut();
}

export function updateNode(boardId, nodeId, nodeData) {
	
    var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	_storeAdapter.updateNode(nodeId, nodeData);

	var updates = {}
	updates["/boards/" + boardId + "/nodes/" + nodeId] = nodeData;
	
    updates["/nodes/" + nodeId] = {
		title: nodeData.title
	};
	
	firebase.database().ref().update(updates, function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		}
	});
}


export function addNode(boardId, nodeData, nodeId = null) {
	console.log("Trying to add node to the board: " + boardId);
    var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	if(!nodeId) {
		nodeId = firebase.database().ref().child("nodes").push().key;
	}
	
	updateNode(boardId, nodeId, nodeData);
}

export function removeNode(boardId, nodeId) {
	console.log("Trying to remove node:" + nodeId);
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
    _storeAdapter.removeNode(nodeId);
    firebase.database().ref("/nodes/" + nodeId).remove(function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error);
		}
		console.log("Node " + nodeId + " is succesfully removed");
	});
	firebase.database().ref("/boards/" + boardId + "/nodes/" + nodeId).remove(function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error);
		}
		console.log("Node " + nodeId + " is succesfully removed from board " + boardId);
	});
}

export function createLine(boardId, lineData, lineId = null) {
	console.log("Trying to add line to the board: " + boardId);
    var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	if(!lineId) {
		lineId = firebase.database().ref("/boards/" + boardId).child("lines").push().key;
	}
		
		
	updateLine(boardId, lineId, lineData);
}

export function updateLine(boardId, lineId, lineData) {
	
    var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	_storeAdapter.updateNode(nodeId, nodeData);

	var updates = {}
	updates["/boards/" + boardId + "/lines/" + lineId] = lineData;
	

	firebase.database().ref().update(updates, function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error.code);
		}
	});
}
	
export function removeLine(boardId, lineId) {
	console.log("Trying to remove line: " + lineId);
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	_storeAdapter.removeLine(lineId);
	firebase.database().ref("/boards/" + boardId + "/lines/" + lineId).remove(function(error) {
		if(error) {
			console.warn(error);
			_storeAdapter.error(error);
		}
		console.log("Line " + lineId + " is succesfully removed");
	});
}
