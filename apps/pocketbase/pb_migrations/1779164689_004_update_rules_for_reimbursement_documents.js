/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reimbursement_documents");
  collection.listRule = "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.user_id = @request.auth.id)";
  collection.viewRule = "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.user_id = @request.auth.id)";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("reimbursement_documents");
  collection.listRule = "@request.auth.id != ''";
  collection.viewRule = "@request.auth.id != ''";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})