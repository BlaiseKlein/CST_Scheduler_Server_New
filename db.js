const admin = require('firebase-admin');
require("dotenv").config();

const serviceAccount = JSON.parse(JSON.parse(JSON.stringify(process.env.SERVACCOUNT)));

module.exports = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();

module.exports = db;