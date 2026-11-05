/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1827260238")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.id != '')",
    "viewRule": "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.id != '')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1827260238")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.user_id = @request.auth.id)",
    "viewRule": "@request.auth.id != '' && (@request.auth.role = 'broker_admin' || request_id.user_id = @request.auth.id)"
  }, collection)

  return app.save(collection)
})
