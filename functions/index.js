const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUserLeaves = functions.firestore
  .document("users/{userId}")
  .onDelete((snap, context) => {
    const deletedUser = snap.data();
    const userId = context.params.userId;

    // Log the deletion
    console.log(`User ${userId} (${deletedUser.email}) deleted. Deleting associated leaves.`);

    const leaveCollection = admin.firestore().collection("leaves");
    const query = leaveCollection.where("userId", "==", userId);

    return query.get().then((snapshot) => {
      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    });
  });
