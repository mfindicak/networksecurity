import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
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

// window.addEmail = async (email, publicKey, privateKey) => {
//   try {
//     const docRef = await addDoc(collection(db, 'emails'), {
//       email: email,
//       publicKey: publicKey,
//       privateKey: privateKey,
//     });
//     console.log('Document written with ID: ', docRef.id);
//   } catch (e) {
//     console.error('Error adding document: ', e);
//   }
// };

window.addEmail = async (email, publicKey) => {
  const emails = collection(db, 'emails');
  try {
    await setDoc(doc(emails, email), {
      email: email,
      publicKey: publicKey,
    });
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

window.getEmailDataIfExit = async (email) => {
  const docRef = doc(db, 'emails', email);

  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    return false;
  }
};

window.getPublicIdOfUser = async (email) => {
  const userData = await window.getEmailDataIfExit(email);
  return userData.publicKey;
};

window.createNewFileId = async () => {
  try {
    const docRef = await addDoc(collection(db, 'files'), {
      isDeleted: false,
    });
    return docRef.id;
  } catch (e) {
    return false;
  }
};

window.createNewEncryptedFile = async (
  fileId,
  sentByEmail,
  sentToEmails,
  encryptedPasswords,
  oldFileName
) => {
  const files = collection(db, 'files');
  try {
    await setDoc(doc(files, fileId), {
      fileId: fileId,
      oldFileName: oldFileName,
      sentByEmail: sentByEmail,
      sentToEmails: sentToEmails,
      encryptedPasswords: encryptedPasswords,
    });
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

window.getFileDataIfExit = async (fileId) => {
  const docRef = doc(db, 'files', fileId);

  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    return false;
  }
};

window.addUsersForFile = async (fileId, sentToEmails, encryptedPasswords) => {
  console.log('burada');
  let fileData = await window.getFileDataIfExit(fileId);
  fileData.sentToEmails = fileData.sentToEmails.concat(sentToEmails);
  fileData.encryptedPasswords =
    fileData.encryptedPasswords.concat(encryptedPasswords);
  console.log(fileData);

  const files = collection(db, 'files');
  try {
    await setDoc(doc(files, fileId), fileData);
    console.log('User Added.');
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

window.getAllEmails = async () => {
  let emails = [];
  const querySnapshot = await getDocs(collection(db, 'emails'));
  querySnapshot.forEach((doc) => {
    emails.push(doc.id);
  });
  return emails;
};

window.getAllFiles = async () => {
  const allFiles = [];
  const querySnapshot = await getDocs(collection(db, 'files'));
  querySnapshot.forEach((doc) => {
    doc = doc.data();
    const file = { fileId: doc.fileId, oldFileName: doc.oldFileName };
    allFiles.push(file);
  });

  return allFiles;
};

window.getEmailsOfFile = async (fileId) => {
  const fileData = await window.getFileDataIfExit(fileId);
  return fileData.sentToEmails;
};
