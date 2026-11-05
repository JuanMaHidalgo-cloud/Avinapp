/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // update collection data
  unmarshal({
    "listRule": "broker_id = @request.auth.broker_id && (@request.auth.role = 'broker_admin' || @request.auth.role = 'client')",
    "viewRule": "broker_id = @request.auth.broker_id && (@request.auth.role = 'broker_admin' || @request.auth.role = 'client')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // update collection data
  unmarshal({
    "listRule": "broker_id = @request.auth.broker_id && @request.auth.role = 'broker_admin'",
    "viewRule": "broker_id = @request.auth.broker_id && @request.auth.role = 'broker_admin'"
  }, collection)

  return app.save(collection)
})
