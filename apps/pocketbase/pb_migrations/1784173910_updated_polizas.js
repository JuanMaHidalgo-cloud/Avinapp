/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // add field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2538208547",
    "help": "",
    "hidden": false,
    "id": "relation1781946704",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "asegurado_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_5153128684")

  // remove field
  collection.fields.removeById("relation1781946704")

  return app.save(collection)
})
