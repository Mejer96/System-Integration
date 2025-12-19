import './style.css';

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// ---------------------------
// Firebase configuration
// ---------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC3v0hEe1wmfhdWAKpeJvSMSBvUI-BjGVA",
  authDomain: "webrtc-dc295.firebaseapp.com",
  projectId: "webrtc-dc295",
  storageBucket: "webrtc-dc295.firebasestorage.app",
  messagingSenderId: "967549457557",
  appId: "1:967549457557:web:0aeffadc33718a0a89b79c"
};

// Initialize Firebase app and Firestore
const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// ---------------------------
// HTML video elements
// ---------------------------
const localVideo = document.getElementById("localVideo");   // Shows local webcam
const remoteVideo = document.getElementById("remoteVideo"); // Shows remote peer's video

// ---------------------------
// Global state
// ---------------------------
const GLOBAL_CALL_ID = "GLOBAL_CALL_ID"; // Shared document ID for signaling
let localStream;                          // MediaStream from local camera/mic
let remoteStream;                         // MediaStream for incoming remote tracks
let peerConnection;                       

// ICE servers (STUN used to find public IP for P2P)
const servers = {
  iceServers: [
      {
          urls: ['stun:stun1.l.google.com:19302'],
      }
  ]
};

// ---------------------------
// Caller function (startCall)
// ---------------------------
async function startCall() {
  // Create references to Firestore documents/collections for signaling
  const callDocument = firestore.collection('calls').doc(GLOBAL_CALL_ID);
  const offerCandidates = callDocument.collection('offerCandidates'); // ICE candidates from caller
  const answerCandidates = callDocument.collection('answerCandidates'); // ICE candidates from callee

  // Get local camera + mic
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  // Prepare empty MediaStream for remote tracks
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  // Create RTCPeerConnection with STUN server
  peerConnection = new RTCPeerConnection(servers);

  // Add local tracks to the peer connection (so the other peer can receive them)
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  // When remote tracks arrive, add them to remoteStream for rendering
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  };

  // When an ICE candidate is generated, add it to Firestore for callee
  peerConnection.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  // Create SDP offer (describes local media and codecs)
  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription); // Set caller's localDescription

  // Write offer to Firestore for callee to read
  await callDocument.set({ offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

  // Listen for answer from callee in Firestore (remoteDescription)
  callDocument.onSnapshot((snapshot) => {
    const data = snapshot.data();
    // Only set remote description once and if answer exists
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription); // Complete SDP handshake
    }
  });

  // Listen for ICE candidates from callee and add them
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        // Only add candidate if remoteDescription exists
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(candidate);
        }
      }
    });
  });
}

// ---------------------------
// Callee function (answerCall)
// ---------------------------
async function answerCall() {
  const callDocument = firestore.collection("calls").doc(GLOBAL_CALL_ID);
  const offerCandidates = callDocument.collection("offerCandidates"); // ICE candidates from caller
  const answerCandidates = callDocument.collection("answerCandidates"); // ICE candidates from callee

  // Create RTCPeerConnection with same STUN server
  peerConnection = new RTCPeerConnection(servers);

  // When an ICE candidate is generated, add it to Firestore for caller
  peerConnection.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  // Get local camera + mic
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  // Prepare empty MediaStream for remote tracks
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  // Add local tracks to peer connection
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  // When remote tracks arrive, add them to remoteStream for rendering
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  };

  // Read caller's offer from Firestore
  const callSnapshot = await callDocument.get();
  if (!callSnapshot.exists || !callSnapshot.data()?.offer) {
    console.error("No offer found."); // Cannot answer a non-existent call
    return;
  }

  // Set caller's offer as remoteDescription
  await peerConnection.setRemoteDescription(new RTCSessionDescription(callSnapshot.data().offer));

  // Create SDP answer describing callee's media
  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription); // Set callee's localDescription

  // Write answer to Firestore for caller to read
  await callDocument.update({ answer: { type: answerDescription.type, sdp: answerDescription.sdp } });

  // Listen for ICE candidates from caller and add them
  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}

// ---------------------------
// UI event listeners
// ---------------------------
document.getElementById("startCall").addEventListener("click", startCall);   // Caller button
document.getElementById("answerCall").addEventListener("click", answerCall); // Callee button
