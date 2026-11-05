/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("user_sessions");
  collection.indexes.push("CREATE UNIQUE INDEX idx_user_sessions_session_id ON user_sessions (session_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("user_sessions");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_user_sessions_session_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})