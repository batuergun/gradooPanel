const crypto = require("crypto");

const webhookSecret = process.env.TYPEFORM_WEBHOOK_SECRET;
const verifySignature = function (receivedSignature:any, payload:any) {
    const hash = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("base64");
    return receivedSignature === `sha256=${hash}`;
  };

const webhookHandler = async (req: any, res: any) => {
  console.log("event received");

  const signature = req.headers["typeform-signature"];
  const isValid = verifySignature(signature, req.rawBody.toString());
  console.log("isvalid", isValid);
  if (!isValid) {
    throw new Error("Webhook signature is not valid, someone is faking this!");
  }

  res.sendStatus(200);

  const { event_type, form_response } = req.body;
  console.log(event_type);

};

export default webhookHandler;
