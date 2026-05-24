import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// ⚠️ 기존 firebase.js 에서 복사해오세요
const firebaseConfig = {
  apiKey: "AIzaSyCiHYkooNJYX6IFd2CLFTkxW69JVAOmk2A",
  authDomain: "maumium-c46a9.firebaseapp.com",
  projectId: "maumium-c46a9",
  storageBucket: "maumium-c46a9.firebasestorage.app",
  messagingSenderId: "766027299974",
  appId: "1:766027299974:web:1f66ee1c4685d732396507"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// 관리자 이메일 목록
export const ADMIN_EMAILS = ['ha90xy@gmail.com']
