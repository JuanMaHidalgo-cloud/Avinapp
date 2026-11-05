/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2538208547")

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "date938793416",
    "max": "",
    "min": "",
    "name": "fecha_nacimiento",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2538208547")

  // remove field
  collection.fields.removeById("date938793416")

  return app.save(collection)
})
