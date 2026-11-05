/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("sms_logs");

  const existing = collection.fields.getByName("sent_at");
  if (existing) {
    if (existing.type === "autodate") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("sent_at"); // exists with wrong type, remove first
  }

  collection.fields.add(new AutodateField({
    name: "sent_at",
    onCreate: true,
    onUpdate: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("sms_logs");
    collection.fields.removeByName("sent_at");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})