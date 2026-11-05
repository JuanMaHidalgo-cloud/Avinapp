/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9057786653")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9057786653")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.role = 'super_admin' || @request.auth.role = 'superadmin'",
    "viewRule": "@request.auth.role = 'super_admin' || @request.auth.role = 'superadmin'"
  }, collection)

  return app.save(collection)
})
