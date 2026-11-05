/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("broker_configuration");
  collection.indexes.push("CREATE UNIQUE INDEX idx_broker_configuration_broker_id ON broker_configuration (broker_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("broker_configuration");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_broker_configuration_broker_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})