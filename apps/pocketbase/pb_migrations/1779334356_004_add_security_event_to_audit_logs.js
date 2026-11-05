/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("audit_logs");

  const existing = collection.fields.getByName("security_event");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("security_event"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "security_event"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("audit_logs");
    collection.fields.removeByName("security_event");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})