/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scheduled_reports");

  const existing = collection.fields.getByName("error_message");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("error_message"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "error_message",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("scheduled_reports");
    collection.fields.removeByName("error_message");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})