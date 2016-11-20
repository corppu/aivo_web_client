import firebase from "firebase";

let _storeAdapter = null;

export function init(storeAdapter) {
    var config = {
        apiKey: "AIzaSyBbKd7Hy_x2niFQ6LQz6S1KnTFXOuDeq4k",
        authDomain: "aivotest-9df12.firebaseapp.com",
        databaseURL: "https://aivotest-9df12.firebaseio.com",
        storageBucket: "aivotest-9df12.appspot.com",
        messagingSenderId: "400034027019"
    };
    firebase.initializeApp(config);

    setNodeListeners(); // temp

    _storeAdapter = storeAdapter;
}

export function createUser(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        // asdadsa
        console.warn(errorMessage);
    });
}

export function signIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        
        console.warn(errorMessage);
    });
}

export function signOut() {
    firebase.auth().signOut();
}

export function moveNode(id, x, y) {
    _storeAdapter.moveNode(id, x, y);

    var postData = {
        x: x,
        y: y
    }
    
    var updates = {}

    updates['/nodes/' + id] = postData;
    //updates['/user-nodes/' + firebase.User.uid + '/' + id] = postData;
	return firebase.database().ref().update(updates);
}

export function addNode(x, y, id = null) {
    _storeAdapter.addNode(id, x, y)

    var postData = {
        x: x,
        y: y
    }
    
    if (id == null) {
        id = firebase.database().ref().child('nodes').push().key;
    }
    
    var updates = {}

    updates['/nodes/' + id] = postData;
    updates['/user-nodes/' + firebase.User.uid + '/' + id] = postData;
    
    return firebase.database().ref().update(updates);
}

export function removeNode(id) {
    _storeAdapter.removeNode(id);
    firebase.database().ref('/nodes/' + id).remove();
}

export function setNodeListeners() {
	var nodesRef = firebase.database().ref('nodes/');
	nodesRef.on('child_added', function(data) {
		_storeAdapter.addNode(data.key, data.val().x, data.val().y);
	});
	
	nodesRef.on('child_changed', function(data) {
		_storeAdapter.moveNode(data.key, data.val().x, data.val().y);
	});
	
	nodesRef.on('child_removed', function(data) {
		_storeAdapter.removeNode(data.key, data.val().x, data.val().y);
	});
}

export function removeNodeListeners() {
	firebase.database().ref('nodes/').off();
}