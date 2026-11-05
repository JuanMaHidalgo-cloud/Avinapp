/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("session_binding_ip");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("session_binding_ip"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "session_binding_ip"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("users");
    collection.fields.removeByName("session_binding_ip");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})