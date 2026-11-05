/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("dashboard_preferences");
  collection.indexes.push("CREATE UNIQUE INDEX idx_dashboard_preferences_user_id ON dashboard_preferences (user_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("dashboard_preferences");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_dashboard_preferences_user_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})