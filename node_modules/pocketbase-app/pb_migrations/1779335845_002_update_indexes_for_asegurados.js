/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("asegurados");
  collection.indexes.push("CREATE UNIQUE INDEX idx_asegurados_asegurado_id ON asegurados (asegurado_id)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_asegurados_numero_identificacion ON asegurados (numero_identificacion)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("asegurados");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_asegurados_asegurado_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_asegurados_numero_identificacion"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})