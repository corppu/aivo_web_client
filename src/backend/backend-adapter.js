import firebase from "firebase";
let _storeAdapter = null;

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
	loadDefaultBoard();
}

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
	} else {
		// No user is signed in.
		console.log("Currently no user is signed in.");
		_storeAdapter.userSignedOut();
		//detachBoardListeners();
	}
	});
}

/** Uuden käyttäjätilin luominen ja kirjautuminen sisään **/
/** Parametreina välitetään sähköposti-osoite ja salasana **/
/** Esiehto: init on kutsuttu ja käyttäjä ei ole kirjautunut sisään. **/
/** Jälkiehto: Puskee virheen sattuessa tunnisteen käyttöliittymälle kutsumalla sovittimen kautta tarvittavaa funktiota. **/
/** 		   Virheettömässä tilanteessa puskee muokatun vakiotaulun sisällön käyttöliittymälle kutsumalla sovittimen kautta tarvittavia funktioita. **/
export function createUserWithEmailAndSignIn(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(
	function(user) {
		var sessionId = "default"; // temp
		_storeAdapter.userSignedIn(createUserData(sessionId, user));
		attachAuthChangedListener();
	},
	function(error) {
		console.warn(error.message);
		_storeAdapter.error(error);
	});
}

/** Kirjautuminen sisään **/
/** Parametreina välitetään sähköposti-osoite ja salasana, sekä ladattavan taulun id ja mahdollinen dialogissa auki oleva node... **/
/** Esiehto: init on kutsuttu ja käyttäjä ei ole kirjautunut sisään. **/
/** Jälkiehto: Puskee viimeisimmän taulun sisällön käyttäjälle **/
/**            tai tulevaisuudessa voidaan istuntotunnuksen perusteella palauttaa edellinen istunto... **/
/**            Virhetilanteessa palauttaa virhetunnisteen käyttöliittymälle kutsumalla sovittimen kautta sopivaa funktiota **/
export function signInWithEmail(email, password) {	
	firebase.auth().signInWithEmailAndPassword(email, password).then(
	function(user) {
		var sessionId = "default"; // temp
		_storeAdapter.userSignedIn(createUserData(sessionId, user));
		attachAuthChangedListener();
	},
	function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.warn(errorMessage);
		_storeAdapter.error(errorCode);
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
export function createBoard(boardData, nodes = null) {
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	
	var boardId = firebase.database().ref().child("boards").push().key;
	firebase.database().ref("boards/"+boardId+"/meta").update(boardData, function(error) {
		if(error) {
			console.warn(error.message);
			_storeAdapter.error(error.code);
		} else {
			openBoard(boardId, "default");
		}
	});
}


export function openBoard(boardId, sessionId) {
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	var userRef = firebase.database().ref("users/"+user.uid);

	var updates = {};
	updates["users/"+user.uid+"/sessions/"+sessionId] = {
		board: boardId
	};
	return firebase.database().ref().update(updates, function(error){
		if(error) {
			console.warn(error.message);
			_storeAdapter.error(error.code);
		}
		else {
			attachBoardListeners(boardId);
		}
	});
}

export function closeBoard(boardId) {
	detachBoardListeners(boardId);
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
}

export function detachBoardListeners(boardId) {
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
	
	return firebase.database().ref().update(updates, function(error) {
		if(error) {
			console.warn(error.message);
			_storeAdapter.error(error.code);
		}
	});
}


export function addNode(boardId, nodeData) {
    var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
	const nodeId = firebase.database().ref().child("nodes").push().key;
	updateNode(boardId, nodeId, nodeData);
}

export function removeNode(boardId, nodeId) {
	var user = firebase.auth().currentUser;
	if(!user) {
		console.warn("User is not authenticated!");
		return;
	}
    _storeAdapter.removeNode(nodeId);
    firebase.database().ref("/nodes/" + nodeId).remove();
	firebase.database().ref("/boards/" + boardId + "/nodes/" + nodeId).remove();
}

