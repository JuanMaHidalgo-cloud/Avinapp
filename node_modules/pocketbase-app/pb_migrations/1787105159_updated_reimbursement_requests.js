/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select8265204286",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Pendiente",
      "En proceso",
      "Devuelto",
      "Finalizado",
      "Rechazado",
      "Aprovado",
      "Acreditado"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_7078900971")

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select8265204286",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "pending",
      "in_review",
      "approved"
    ]
  }))

  return app.save(collection)
})
