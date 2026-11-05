/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update collection data
  unmarshal({
    "viewRule": "user_id = @request.auth.id || broker_id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update collection data
  unmarshal({
    "viewRule": "user_id = @request.auth.id || (@request.auth.role = 'broker_admin' && broker_id = @request.auth.broker_id)"
  }, collection)

  return app.save(collection)
})
