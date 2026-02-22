// ඔබේ Firebase Config එක මෙතනට දාන්න
const firebaseConfig = {
    apiKey: "AIzaSyAs-ExampleKey123456789", // මෙය උදාහරණයකි
  authDomain: "lakmina-chat.firebaseapp.com",
  projectId: "lakmina-chat",
  storageBucket: "lakmina-chat.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = "";

async function login() {
    const name = document.getElementById('username').value.trim();
    if (!name) return;

    // නම පරීක්ෂා කිරීම (User name check)
    const userRef = db.collection("users").doc(name);
    const doc = await userRef.get();

    if (doc.exists) {
        document.getElementById('error').style.display = "block";
    } else {
        await userRef.set({ online: true });
        currentUser = name;
        document.getElementById('login-screen').style.display = "none";
        document.getElementById('chat-screen').style.display = "block";
        document.getElementById('display-name').innerText = "User: " + currentUser;
        loadMessages();
    }
}

function sendMessage() {
    const text = document.getElementById('messageInput').value;
    if (!text) return;

    db.collection("messages").add({
        user: currentUser,
        message: text,
        type: "text",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('messageInput').value = "";
}

function loadMessages() {
    db.collection("messages").orderBy("timestamp")
        .onSnapshot((snapshot) => {
            const msgArea = document.getElementById('messages');
            msgArea.innerHTML = "";
            snapshot.forEach((doc) => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = "msg";
                div.innerHTML = `<b>${data.user}:</b> ${data.message}`;
                msgArea.appendChild(div);
            });
            msgArea.scrollTop = msgArea.scrollHeight;
        });
}

// පින්තූර යැවීම
async function uploadFile() {
    const file = document.getElementById('fileInput').files[0];
    const storageRef = storage.ref(`uploads/${file.name}`);
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();

    db.collection("messages").add({
        user: currentUser,
        message: `<img src="${url}" width="100%">`,
        type: "image",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Call පහසුකම සඳහා (සරල පණිවිඩයක් ලෙස)
function startCall() {
    alert("Calling feature requires WebRTC signaling server. Message sent to group.");
    db.collection("messages").add({
        user: currentUser,
        message: "📞 Started a voice/video call...",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function login() {
    const name = document.getElementById('username').value.trim();
    if (!name) {
        alert("කරුණාකර නමක් ඇතුළත් කරන්න!");
        return;
    }

    // මෙතැනදී දැනට Firebase නැති නිසා කෙලින්ම Chat එකට යවමු
    currentUser = name;
    document.getElementById('login-screen').style.display = "none";
    document.getElementById('chat-screen').style.display = "block";
    document.getElementById('display-name').innerText = "පරිශීලක: " + currentUser;
    
    // Firebase සම්බන්ධ කර ඇත්නම් පමණක් මෙය වැඩ කරයි
    try {
        loadMessages();
    } catch(e) {
        console.log("Firebase config එක තවම දාලා නැහැ.");
    }

}
