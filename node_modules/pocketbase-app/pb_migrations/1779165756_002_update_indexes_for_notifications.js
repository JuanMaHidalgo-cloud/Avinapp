/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("notifications");
  collection.indexes.push("CREATE INDEX idx_notifications_user_id ON notifications (user_id)");
  collection.indexes.push("CREATE INDEX idx_notifications_is_read ON notifications (is_read)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("notifications");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_notifications_user_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_notifications_is_read"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})