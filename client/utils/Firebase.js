import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyBb_0dWQMoQdkoJC45bBQ_Z7W4JnvT5dj8",
  authDomain: "opennem-1.firebaseapp.com",
  projectId: "opennem-1",
  storageBucket: "opennem-1.appspot.com",
}

firebase.initializeApp(config)

export const FirebaseStorage = firebase.storage()