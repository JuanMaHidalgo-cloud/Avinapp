/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'super_admin'",
    "deleteRule": "@request.auth.role = 'super_admin'",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text1438174327",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
          },
          {
                "hidden": false,
                "id": "text5774212832",
                "name": "broker_id",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text7675798961",
                "name": "name",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "email4244234144",
                "name": "email",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "email",
                "exceptDomains": [],
                "onlyDomains": []
          },
          {
                "hidden": false,
                "id": "text8442414816",
                "name": "phone",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text0864573298",
                "name": "address",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text8787307823",
                "name": "city",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text5206022035",
                "name": "country",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text8898629056",
                "name": "registration_number",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "select0235081894",
                "name": "status",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                      "active",
                      "inactive",
                      "suspended"
                ]
          },
          {
                "hidden": false,
                "id": "select6403490412",
                "name": "subscription_tier",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                      "basic",
                      "professional",
                      "enterprise"
                ]
          },
          {
                "hidden": false,
                "id": "number7640858065",
                "name": "max_users",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
          },
          {
                "hidden": false,
                "id": "json5891200513",
                "name": "features_enabled",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "json",
                "maxSize": 0
          },
          {
                "hidden": false,
                "id": "autodate6453763401",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate3787109892",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_9057786653",
    "indexes": [],
    "listRule": "@request.auth.role = 'super_admin'",
    "name": "brokers",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'super_admin'",
    "viewRule": "@request.auth.role = 'super_admin' || broker_id = @request.auth.broker_id"
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_9057786653");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})