/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  checkPolicyExpiration(e.record);
  e.next();
}, "policies");

onRecordAfterUpdateSuccess((e) => {
  checkPolicyExpiration(e.record);
  e.next();
}, "policies");

function checkPolicyExpiration(policyRecord) {
  try {
    const endDate = policyRecord.get("end_date");
    if (!endDate) return;
    
    const endDateObj = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntilExpiry = Math.ceil((endDateObj - today) / (1000 * 60 * 60 * 24));
    
    // Check if policy expires within 7 days
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
      const brokerId = policyRecord.get("broker_id");
      const policyNumber = policyRecord.get("policy_number");
      const insuranceType = policyRecord.get("insurance_type");
      const userId = policyRecord.get("user_id");
      
      // Fetch user for client name
      const user = $app.findRecordById("users", userId);
      const clientName = user ? (user.get("full_name") || user.get("name")) : "Client";
      
      // Fetch broker configuration for branding
      const brokerConfig = $app.findFirstRecordByData("broker_configuration", "broker_id", brokerId);
      const brokerName = brokerConfig ? brokerConfig.get("broker_name") : "Insurance Broker";
      
      // Fetch all broker_admin users for this broker
      const brokerAdmins = $app.findRecordsByFilter("users", "broker_id = '" + brokerId + "' && role = 'broker_admin'");
      
      const expirationDate = endDateObj.toLocaleDateString("en-US");
      
      brokerAdmins.forEach((admin) => {
        const adminLanguage = admin.get("language") || "en";
        
        // Email content based on language
        const emailContent = {
          "en": {
            subject: "Policy Expiring Soon",
            title: "Policy Expiration Alert",
            clientLabel: "Client Name",
            policyLabel: "Policy Number",
            typeLabel: "Insurance Type",
            expiresLabel: "Expiration Date",
            daysLabel: "Days Until Expiry"
          },
          "es": {
            subject: "Póliza Próxima a Vencer",
            title: "Alerta de Vencimiento de Póliza",
            clientLabel: "Nombre del Cliente",
            policyLabel: "Número de Póliza",
            typeLabel: "Tipo de Seguro",
            expiresLabel: "Fecha de Vencimiento",
            daysLabel: "Días Hasta el Vencimiento"
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
              <p>A policy under your management is expiring soon. Please review the details below:</p>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p><strong>${content.clientLabel}:</strong> ${clientName}</p>
                <p><strong>${content.policyLabel}:</strong> ${policyNumber}</p>
                <p><strong>${content.typeLabel}:</strong> ${insuranceType}</p>
                <p><strong>${content.expiresLabel}:</strong> ${expirationDate}</p>
                <p><strong>${content.daysLabel}:</strong> ${daysUntilExpiry}</p>
              </div>
              <p>Please contact the client to discuss renewal options.</p>
              <p>Best regards,<br>${brokerName}</p>
            </div>
          `
        });
        
        $app.newMailClient().send(message);
        
        // Create in-app notification for broker_admin
        const notification = new Record("notifications");
        notification.set("user_id", admin.id);
        notification.set("type", "policy_expiring");
        notification.set("title", content.subject);
        notification.set("message", `Policy ${policyNumber} for ${clientName} expires in ${daysUntilExpiry} days`);
        notification.set("related_id", policyRecord.id);
        notification.set("action_url", "/admin/policies/" + policyRecord.id);
        notification.set("is_read", false);
        $app.save(notification);
      });
    }
  } catch (error) {
    console.log("Error in policy-expiring-soon hook:", error);
  }
}