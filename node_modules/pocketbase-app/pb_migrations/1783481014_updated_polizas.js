/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // update field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text0315278512",
    "max": 10,
    "min": 0,
    "name": "numero_identificacion",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // update field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text0315278512",
    "max": 0,
    "min": 0,
    "name": "numero_identificacion",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
