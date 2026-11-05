/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);
  record.set("email", "jmhidalgo@hunkaagenciadigital.com");
  record.setPassword("TempPass2026!Hunka");
  record.set("role", "super_admin");
  record.set("broker_id", "hunka_master");
  record.set("role_id", "super_admin_master");
  record.set("full_name", "Hunka Master Admin");
  try {
    return app.save(record);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("users", "email", "jmhidalgo@hunkaagenciadigital.com");
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})