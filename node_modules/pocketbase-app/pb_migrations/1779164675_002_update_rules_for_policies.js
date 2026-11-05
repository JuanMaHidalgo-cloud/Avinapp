/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("policies");
  collection.listRule = "user_id = @request.auth.id || (@request.auth.role = 'broker_admin' && broker_id = @request.auth.broker_id)";
  collection.viewRule = "user_id = @request.auth.id || (@request.auth.role = 'broker_admin' && broker_id = @request.auth.broker_id)";
  collection.createRule = "@request.auth.role = 'broker_admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("policies");
  collection.listRule = "user_id = @request.auth.id || @request.auth.role = 'broker_admin'";
  collection.viewRule = "user_id = @request.auth.id || @request.auth.role = 'broker_admin'";
  collection.createRule = "@request.auth.role = 'broker_admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})