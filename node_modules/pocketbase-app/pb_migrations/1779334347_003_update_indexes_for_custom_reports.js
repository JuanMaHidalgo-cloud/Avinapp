/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("custom_reports");
  collection.indexes.push("CREATE UNIQUE INDEX idx_custom_reports_report_id ON custom_reports (report_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("custom_reports");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_custom_reports_report_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})