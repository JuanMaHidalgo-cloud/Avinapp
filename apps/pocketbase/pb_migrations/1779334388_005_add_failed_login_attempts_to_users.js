/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("failed_login_attempts");
  if (existing) {
    if (existing.type === "number") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("failed_login_attempts"); // exists with wrong type, remove first
  }

  collection.fields.add(new NumberField({
    name: "failed_login_attempts"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("users");
    collection.fields.removeByName("failed_login_attempts");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})