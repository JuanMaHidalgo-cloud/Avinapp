/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text128467647",
    "max": 0,
    "min": 0,
    "name": "marca_vehiculo",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3053500616",
    "max": 0,
    "min": 0,
    "name": "modelo_vehiculo",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // remove field
  collection.fields.removeById("text128467647")

  // remove field
  collection.fields.removeById("text3053500616")

  return app.save(collection)
})
