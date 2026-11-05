/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (broker_id = @request.auth.broker_id || @request.auth.role = 'broker_admin')",
    "viewRule": "@request.auth.id != \"\" && (broker_id = @request.auth.broker_id || @request.auth.role = 'broker_admin')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update collection data
  unmarshal({
    "listRule": "user_id = @request.auth.id || broker_id != \"\"",
    "viewRule": "user_id = @request.auth.id || broker_id != \"\""
  }, collection)

  return app.save(collection)
})
