/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(28, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3265035979",
    "max": 0,
    "min": 0,
    "name": "numero_identificacion",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("text3265035979")

  return app.save(collection)
})
