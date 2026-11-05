/// <reference path="../pb_data/types.d.ts" />
// Hook to send scheduled reports
// Runs on a schedule to find reports that need to be sent and process them

onRecordAfterCreateSuccess((e) => {
  // When a scheduled report is created, initialize status to 'pending'
  if (!e.record.get("status")) {
    e.record.set("status", "pending");
  }
  e.next();
}, "scheduled_reports");

// This hook handles the actual sending logic
// In a real implementation, this would be triggered by a cron job or scheduled task
onRecordUpdate((e) => {
  // When updating a scheduled report, ensure status is valid
  const status = e.record.get("status");
  if (status && !["pending", "sent", "failed"].includes(status)) {
    throw new BadRequestError("Invalid status value. Must be one of: pending, sent, failed");
  }
  e.next();
}, "scheduled_reports");

// Hook to handle successful report sending
onRecordAfterUpdateSuccess((e) => {
  const status = e.record.get("status");
  
  // If status changed to 'sent', ensure sent_at is set
  if (status === "sent" && !e.record.get("sent_at")) {
    const today = new Date().toISOString().split('T')[0];
    e.record.set("sent_at", today);
    $app.save(e.record);
  }
  
  // If status changed to 'failed', ensure error_message is present
  if (status === "failed" && !e.record.get("error_message")) {
    e.record.set("error_message", "Report sending failed without error details");
    $app.save(e.record);
  }
  
  e.next();
}, "scheduled_reports");