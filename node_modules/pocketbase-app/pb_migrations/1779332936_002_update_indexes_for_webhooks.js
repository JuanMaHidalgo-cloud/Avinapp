/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("webhooks");
  collection.indexes.push("CREATE UNIQUE INDEX idx_webhooks_webhook_id ON webhooks (webhook_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("webhooks");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_webhooks_webhook_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})