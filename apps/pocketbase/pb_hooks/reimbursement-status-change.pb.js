/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const originalStatus = e.record.original().get("status");
  const newStatus = e.record.get("status");
  
  // Only proceed if status actually changed
  if (originalStatus === newStatus) {
    e.next();
    return;
  }
  
  try {
    const requestId = e.record.id;
    const userId = e.record.get("user_id");
    const brokerId = e.record.get("broker_id");
    const policyId = e.record.get("policy_id");
    
    // Fetch user record
    const user = $app.findRecordById("users", userId);
    if (!user) {
      e.next();
      return;
    }
    
    // Fetch broker configuration
    const brokerConfig = $app.findFirstRecordByData("broker_configuration", "broker_id", brokerId);
    
    // Fetch policy for policy number
    const policy = $app.findRecordById("policies", policyId);
    const policyNumber = policy ? policy.get("policy_number") : "N/A";
    
    // Get user's language preference
    const userLanguage = user.get("language") || "en";
    
    // Status translations
    const statusLabels = {
      "pending": { "en": "Pending", "es": "Pendiente" },
      "in_review": { "en": "In Review", "es": "En Revisión" },
      "approved": { "en": "Approved", "es": "Aprobado" }
    };
    
    const statusLabel = statusLabels[newStatus] ? statusLabels[newStatus][userLanguage] : newStatus;
    
    // Email content based on language
    const emailContent = {
      "en": {
        subject: "Reimbursement Request Status Update",
        title: "Your Reimbursement Request Status Has Changed",
        policyLabel: "Policy Number",
        requestLabel: "Request ID",
        statusLabel: "New Status",
        dateLabel: "Date Changed",
        viewLabel: "View Request"
      },
      "es": {
        subject: "Actualización del Estado de la Solicitud de Reembolso",
        title: "El Estado de Su Solicitud de Reembolso Ha Cambiado",
        policyLabel: "Número de Póliza",
        requestLabel: "ID de Solicitud",
        statusLabel: "Nuevo Estado",
        dateLabel: "Fecha de Cambio",
        viewLabel: "Ver Solicitud"
      }
    };
    
    const content = emailContent[userLanguage] || emailContent["en"];
    const currentDate = new Date().toLocaleDateString(userLanguage === "es" ? "es-ES" : "en-US");
    const actionUrl = "/reimbursement/" + requestId;
    
    // Send email to user
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: user.get("email") }],
      subject: content.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${content.title}</h2>
          <p>Dear ${user.get("full_name") || user.get("name")},</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>${content.policyLabel}:</strong> ${policyNumber}</p>
            <p><strong>${content.requestLabel}:</strong> ${requestId}</p>
            <p><strong>${content.statusLabel}:</strong> <span style="color: #2c3e50; font-weight: bold;">${statusLabel}</span></p>
            <p><strong>${content.dateLabel}:</strong> ${currentDate}</p>
          </div>
          <p><a href="${actionUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${content.viewLabel}</a></p>
          <p>Best regards,<br>The Reimbursement Team</p>
        </div>
      `
    });
    
    $app.newMailClient().send(message);
    
    // Create in-app notification for user
    const userNotification = new Record("notifications");
    userNotification.set("user_id", userId);
    userNotification.set("type", "status_change");
    userNotification.set("title", content.subject);
    userNotification.set("message", `Your reimbursement request #${requestId} status is now: ${statusLabel}`);
    userNotification.set("related_id", requestId);
    userNotification.set("action_url", actionUrl);
    userNotification.set("is_read", false);
    $app.save(userNotification);
    
    // Create notification for broker_admin
    const brokerAdmins = $app.findRecordsByFilter("users", "broker_id = '" + brokerId + "' && role = 'broker_admin'");
    brokerAdmins.forEach((admin) => {
      const adminNotification = new Record("notifications");
      adminNotification.set("user_id", admin.id);
      adminNotification.set("type", "status_change");
      adminNotification.set("title", "Reimbursement Request Status Updated");
      adminNotification.set("message", `Request #${requestId} from ${user.get("full_name") || user.get("name")} is now ${statusLabel}`);
      adminNotification.set("related_id", requestId);
      adminNotification.set("action_url", "/admin/reimbursement/" + requestId);
      adminNotification.set("is_read", false);
      $app.save(adminNotification);
    });
    
  } catch (error) {
    console.log("Error in reimbursement-status-change hook:", error);
  }
  
  e.next();
}, "reimbursement_requests");