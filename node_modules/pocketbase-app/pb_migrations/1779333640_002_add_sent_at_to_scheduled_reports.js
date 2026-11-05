/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scheduled_reports");

  const existing = collection.fields.getByName("sent_at");
  if (existing) {
    if (existing.type === "date") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("sent_at"); // exists with wrong type, remove first
  }

  collection.fields.add(new DateField({
    name: "sent_at",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("scheduled_reports");
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