import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDeJSJa3Wh5iV0PNFSsraa4ndhBIvYUK_M",
  authDomain: "ucp-guard.firebaseapp.com",
  projectId: "ucp-guard",
  storageBucket: "ucp-guard.firebasestorage.app",
  messagingSenderId: "220407655494",
  appId: "1:220407655494:web:bbe5c0ada4aa825b90ee47",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const storage = getStorage(app);
