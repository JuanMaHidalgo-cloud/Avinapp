/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("webhook_logs");
  collection.indexes.push("CREATE UNIQUE INDEX idx_webhook_logs_log_id ON webhook_logs (log_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("webhook_logs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_webhook_logs_log_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})