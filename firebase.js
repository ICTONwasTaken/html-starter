import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; 
import { getDatabase, ref, set, get, update, onValue, remove } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"; 

const firebaseConfig = { 
  apiKey: "AIzaSyDkWvzrLrzPWShK1a6RhmrRJ6ChxAl2sHI", 
  authDomain: "realsomething.firebaseapp.com", 
  databaseURL: "https://realsomething-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "realsomething", }; const app = initializeApp(firebaseConfig); 
  
const db = getDatabase(app);