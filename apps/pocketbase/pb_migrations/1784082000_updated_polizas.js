/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "number3510400191",
    "max": null,
    "min": null,
    "name": "monto_cobertura",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // remove field
  collection.fields.removeById("number3510400191")

  return app.save(collection)
})
