/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("language");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("language"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "language",
    required: false,
    values: ["es", "en"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("users");
    collection.fields.removeByName("language");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})