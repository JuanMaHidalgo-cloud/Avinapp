/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scheduled_reports");
  collection.indexes.push("CREATE INDEX idx_scheduled_reports_broker_id ON scheduled_reports (broker_id)");
  collection.indexes.push("CREATE INDEX idx_scheduled_reports_next_send ON scheduled_reports (next_send)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("scheduled_reports");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_scheduled_reports_broker_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_scheduled_reports_next_send"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})