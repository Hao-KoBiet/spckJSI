import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js"


  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC_Gz6hO4uO9SoVbaAj4S5DxO_2hhm6vS8",
    authDomain: "spckjsi068.firebaseapp.com",
    projectId: "spckjsi068",
    storageBucket: "spckjsi068.firebasestorage.app",
    messagingSenderId: "424609342578",
    appId: "1:424609342578:web:064537b1c6d399593c4eeb"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log("Firebase initialized", app.name);
  
  export { auth, db };
  