import { buffer } from 'micro'
import { createClient } from '@supabase/supabase-js'
const crypto = require("crypto");

export default async function webhookReceiver(req, res) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const rawBody = (await buffer(req)).toString()
    const webhookdata = JSON.parse(rawBody)

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

    const form_response = webhookdata.form_response

    var firstname = " ";
    var lastname = " ";
    var phone = " ";
    var email = " ";
    var usertype = " ";
    var school = " ";
    var submitted_at = " ";
    var highschool_city = " ";
    var university_program = " ";
    var schoolclass = " ";

    var eventID = form_response.definition.title;
    submitted_at = form_response.submitted_at;
    firstname = form_response.answers[0].text;
    lastname = form_response.answers[1].text;

    form_response.answers.forEach((answer) => {
        switch (answer.field.ref) {
            case "usertype":
                usertype = answer.choice.label;
                break;
            case "highschool-name":
                school = answer.text;
                break;
            case "highschool-city":
                highschool_city = answer.choice.label;
                break;
            case "highschool-class":
                schoolclass = answer.choice.label;
                break;
            case "university-name":
                school = answer.choice.label;
                break;
            case "university-program":
                university_program = answer.text;
                break;
            case "university-class":
                schoolclass = answer.choice.label;
                break;
        }
        if (answer.field.type === "phone_number") phone = answer.phone_number;
        if (answer.field.type === "email") email = answer.email;
    });

    let searchstring = ''
    if (school != " ") {
        let splitted = ''
        if (JSON.stringify(school).includes(' ')) {
            splitted = JSON.stringify(school).replaceAll(' ', ' & ')
            searchstring = searchstring.concat(splitted)
        } else { searchstring = searchstring.concat(JSON.stringify(school)) }
    }

    if (highschool_city.length > 1) {
        searchstring = searchstring.concat(' & ', highschool_city)
    }

    const { data } = await supabase.rpc('indexschool', { input: searchstring })

    let citystring = ''
    let schoolquery = ''

    if (data !== null) {
        if (data.length > 0) {
            schoolquery = data[0].name
            citystring = citystring.concat(data[0].city)
        } else {
            schoolquery = school
            citystring = citystring.concat(highschool_city)
        }
    } else {
        schoolquery = school
        citystring = citystring.concat(highschool_city)
    }

    console.log('string - ', searchstring, 'data - ', data)

    const { error } = await supabase
        .from('applications')
        .insert({
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            email: email,
            usertype: usertype,
            school: schoolquery,
            event: eventID,
            submitted_at: submitted_at,
            city: citystring,
            class: schoolclass
        })

    res.status(200)
}

export const config = {
    api: {
        bodyParser: false,
    },
}