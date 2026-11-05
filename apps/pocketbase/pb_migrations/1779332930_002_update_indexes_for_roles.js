/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");
  collection.indexes.push("CREATE UNIQUE INDEX idx_roles_role_id ON roles (role_id)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("roles");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_roles_role_id"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})