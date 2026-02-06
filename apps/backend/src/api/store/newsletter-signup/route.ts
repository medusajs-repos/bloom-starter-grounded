import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import {
  createCustomersWorkflow,
  linkCustomersToCustomerGroupWorkflow,
} from "@medusajs/medusa/core-flows";

type NewsletterSignupBody = {
  email: string;
  name?: string;
};

export async function POST(
  req: MedusaRequest<NewsletterSignupBody>,
  res: MedusaResponse,
) {
  const { email, name } = req.validatedBody;
  const query = req.scope.resolve("query");

  // Look up Newsletter Subscribers group
  const { data: customerGroups } = await query.graph({
    entity: "customer_group",
    fields: ["id"],
    filters: { name: "Newsletter Subscribers" },
  });

  if (!customerGroups[0]) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Newsletter Subscribers group not found",
    );
  }

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.id"],
    filters: { email },
  });

  let customerId = customers[0]?.id;
  const existingGroups = customers[0]?.groups || [];

  const alreadySubscribed = existingGroups.some(
    (group) => group != null && group.id === customerGroups[0].id,
  );

  if (alreadySubscribed) {
    return res.status(200).json({
      success: false,
      message: "This email is already subscribed to our newsletter",
      alreadySubscribed: true,
    });
  }

  if (!customerId) {
    const { result } = await createCustomersWorkflow(req.scope).run({
      input: {
        customersData: [
          {
            email,
            first_name: name || undefined,
            has_account: false,
          },
        ],
      },
    });
    customerId = result[0].id;
  }

  await linkCustomersToCustomerGroupWorkflow(req.scope).run({
    input: {
      id: customerGroups[0].id,
      add: [customerId],
    },
  });

  try {
    const notificationModuleService = req.scope.resolve(Modules.NOTIFICATION);

    const greeting = name ? `Hi ${name},` : "Hi there,";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0;">GROUNDED</h1>
    </div>
    <div style="padding: 40px 32px;">
      <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 500; margin: 0 0 24px 0;">Welcome to the Newsletter</h2>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">${greeting}</p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Thank you for subscribing to the Grounded newsletter. You're now part of our community and will be the first to know about:</p>
      <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 24px;">
        <li>New collection launches</li>
        <li>Exclusive offers and promotions</li>
        <li>Style inspiration and tips</li>
        <li>Behind-the-scenes content</li>
      </ul>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0;">We're excited to have you with us.</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 24px 32px; text-align: center; border-top: 1px solid #eaeaea;">
      <p style="color: #888888; font-size: 14px; margin: 0;">Grounded - Timeless Elegance</p>
    </div>
  </div>
</body>
</html>`;

    await notificationModuleService.createNotifications([
      {
        to: email,
        channel: "email",
        template: "",
        data: {},
        content: {
          subject: "Welcome to the Grounded Newsletter",
          html,
        },
      },
    ]);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return res.status(200).json({
    success: true,
    message: "Successfully subscribed to newsletter",
  });
}
