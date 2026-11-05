/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    const requestId = e.record.id;
    const userId = e.record.get("user_id");
    const brokerId = e.record.get("broker_id");
    const policyId = e.record.get("policy_id");
    const description = e.record.get("description");
    
    // Fetch user record
    const user = $app.findRecordById("users", userId);
    if (!user) {
      e.next();
      return;
    }
    
    // Fetch policy for policy number
    const policy = $app.findRecordById("policies", policyId);
    const policyNumber = policy ? policy.get("policy_number") : "N/A";
    
    // Fetch broker configuration for branding
    const brokerConfig = $app.findFirstRecordByData("broker_configuration", "broker_id", brokerId);
    const brokerName = brokerConfig ? brokerConfig.get("broker_name") : "Insurance Broker";
    
    // Fetch all broker_admin users for this broker
    const brokerAdmins = $app.findRecordsByFilter("users", "broker_id = '" + brokerId + "' && role = 'broker_admin'");
    
    const clientName = user.get("full_name") || user.get("name");
    const submissionDate = new Date().toLocaleDateString("en-US");
    const actionUrl = "/admin/reimbursement/" + requestId;
    
    brokerAdmins.forEach((admin) => {
      const adminLanguage = admin.get("language") || "en";
      
      // Email content based on language
      const emailContent = {
        "en": {
          subject: "New Reimbursement Request",
          title: "New Reimbursement Request Submitted",
          clientLabel: "Client Name",
          policyLabel: "Policy Number",
          requestLabel: "Request ID",
          descriptionLabel: "Description",
          submittedLabel: "Submitted Date",
          reviewLabel: "Review Request"
        },
        "es": {
          subject: "Nueva Solicitud de Reembolso",
          title: "Nueva Solicitud de Reembolso Presentada",
          clientLabel: "Nombre del Cliente",
          policyLabel: "Número de Póliza",
          requestLabel: "ID de Solicitud",
          descriptionLabel: "Descripción",
          submittedLabel: "Fecha de Presentación",
          reviewLabel: "Revisar Solicitud"
        }
      };
      
      const content = emailContent[adminLanguage] || emailContent["en"];
      
      // Send email to broker_admin
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: brokerName
        },
        to: [{ address: admin.get("email") }],
        subject: content.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${content.title}</h2>
            <p>Dear ${admin.get("full_name") || admin.get("name")},</p>
            <p>A new reimbursement request has been submitted. Please review the details below:</p>
            <div style="background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
              <p><strong>${content.clientLabel}:</strong> ${clientName}</p>
              <p><strong>${content.policyLabel}:</strong> ${policyNumber}</p>
              <p><strong>${content.requestLabel}:</strong> ${requestId}</p>
              <p><strong>${content.descriptionLabel}:</strong> ${description || "No description provided"}</p>
              <p><strong>${content.submittedLabel}:</strong> ${submissionDate}</p>
            </div>
            <p><a href="${actionUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${content.reviewLabel}</a></p>
            <p>Best regards,<br>${brokerName}</p>
          </div>
        `
      });
      
      $app.newMailClient().send(message);
      
      // Create in-app notification for broker_admin
      const notification = new Record("notifications");
      notification.set("user_id", admin.id);
      notification.set("type", "new_request");
      notification.set("title", content.subject);
      notification.set("message", `New reimbursement request #${requestId} from ${clientName}`);
      notification.set("related_id", requestId);
      notification.set("action_url", actionUrl);
      notification.set("is_read", false);
      $app.save(notification);
    });
    
  } catch (error) {
    console.log("Error in new-reimbursement-request hook:", error);
  }
  
  e.next();
}, "reimbursement_requests");