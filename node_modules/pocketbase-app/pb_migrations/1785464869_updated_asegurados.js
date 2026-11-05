/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2538208547")

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text4095880580",
    "max": 0,
    "min": 0,
    "name": "estado_civil",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2538208547")

  // remove field
  collection.fields.removeById("text4095880580")

  return app.save(collection)
})
