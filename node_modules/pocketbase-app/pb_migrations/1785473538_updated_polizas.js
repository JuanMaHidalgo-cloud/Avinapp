/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3930739194",
    "max": 0,
    "min": 0,
    "name": "placa_vehiculo",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text389302978",
    "max": 0,
    "min": 0,
    "name": "anio_vehiculo",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2356231254",
    "max": 0,
    "min": 0,
    "name": "chasis_vehiculo",
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
  collection.fields.removeById("text3930739194")

  // remove field
  collection.fields.removeById("text389302978")

  // remove field
  collection.fields.removeById("text2356231254")

  return app.save(collection)
})
