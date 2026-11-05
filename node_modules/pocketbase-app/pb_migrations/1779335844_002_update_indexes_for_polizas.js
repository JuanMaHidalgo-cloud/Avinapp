/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("polizas");
  collection.indexes.push("CREATE UNIQUE INDEX idx_polizas_poliza_id ON polizas (poliza_id)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_polizas_numero_poliza ON polizas (numero_poliza)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("polizas");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_polizas_poliza_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_polizas_numero_poliza"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})