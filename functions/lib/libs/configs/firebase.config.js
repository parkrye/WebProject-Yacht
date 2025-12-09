"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.app = void 0;
exports.initializeFirebase = initializeFirebase;
exports.getFirebaseDatabase = getFirebaseDatabase;
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
let app;
let database;
function initializeFirebase() {
    if (!app) {
        exports.app = app = (0, app_1.initializeApp)(firebaseConfig);
    }
    return app;
}
function getFirebaseDatabase() {
    if (!database) {
        const firebaseApp = initializeFirebase();
        exports.database = database = (0, database_1.getDatabase)(firebaseApp);
    }
    return database;
}
//# sourceMappingURL=firebase.config.js.map