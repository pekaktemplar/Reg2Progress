// TODO: Ganti dengan konfigurasi Firebase Anda yang sebenarnya
// Anda bisa mendapatkan detail ini dari konsol Firebase proyek Anda.
// https://console.firebase.google.com/

export const firebaseConfig = {
  apiKey: "AIzaSyBjAMDFt7zx6URFehFnmVBqapeFszJ62XY",
  authDomain: "reg2progress.firebaseapp.com",
  projectId: "reg2progress",
  storageBucket: "reg2progress.firebasestorage.app",
  messagingSenderId: "418695492145",
  appId: "1:418695492145:web:6df027f155ead9f1489b10",
  measurementId: "MASUKKAN_MEASUREMENT_ID_ANDA_DI_SINI" // Opsional
};

// Untuk menggunakan Firebase di aplikasi Anda:
// 1. Pastikan Anda telah menambahkan Firebase SDK ke proyek Anda.
// 2. Impor konfigurasi ini dan inisialisasi Firebase di file utama Anda (misalnya, index.tsx atau App.tsx).
/*
   Contoh inisialisasi di index.tsx:

   import { initializeApp } from "firebase/app"; // Anda perlu menambahkan firebase ke dependensi
   import { firebaseConfig } from './firebaseConfig';

   // Inisialisasi Firebase
   const app = initializeApp(firebaseConfig);

   // Kemudian Anda dapat mulai menggunakan layanan Firebase seperti Firestore, Auth, dll.
*/
