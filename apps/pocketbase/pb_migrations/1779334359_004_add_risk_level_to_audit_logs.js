/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("audit_logs");

  const existing = collection.fields.getByName("risk_level");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("risk_level"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "risk_level",
    values: ["low", "medium", "high", "critical"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("audit_logs");
    collection.fields.removeByName("risk_level");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})