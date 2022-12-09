import { buffer } from 'micro'
const crypto = require("crypto");

export default async function webhookReceiver(req, res) {

    const rawBody = (await buffer(req)).toString()
    const data = JSON.parse(rawBody)

    const webhookSecret = process.env.TYPEFORM_WEBHOOK_SECRET;
    const verifySignature = function (receivedSignature, payload) {
        const hash = crypto
            .createHmac("sha256", webhookSecret)
            .update(payload)
            .digest("base64");
        return receivedSignature === `sha256=${hash}`;
    };

    const signature = req.headers["typeform-signature"];
    const isValid = verifySignature(signature, rawBody.toString());
    console.log("isvalid", isValid);
    if (!isValid) {
        throw new Error("Webhook signature is not valid, someone is faking this!");
    }

    res.sendStatus(200);
    console.log(data)
}

export const config = {
    api: {
        bodyParser: false,
    },
}