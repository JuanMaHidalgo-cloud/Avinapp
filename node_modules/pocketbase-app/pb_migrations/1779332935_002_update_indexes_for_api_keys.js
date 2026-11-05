/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("api_keys");
  collection.indexes.push("CREATE UNIQUE INDEX idx_api_keys_api_key_id ON api_keys (api_key_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("api_keys");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_api_keys_api_key_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})