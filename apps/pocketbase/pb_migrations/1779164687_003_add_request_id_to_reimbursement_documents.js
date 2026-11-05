/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const reimbursement_requestsCollection = app.findCollectionByNameOrId("reimbursement_requests");
  const collection = app.findCollectionByNameOrId("reimbursement_documents");

  const existing = collection.fields.getByName("request_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("request_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "request_id",
    required: true,
    collectionId: reimbursement_requestsCollection.id,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("reimbursement_documents");
    collection.fields.removeByName("request_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})