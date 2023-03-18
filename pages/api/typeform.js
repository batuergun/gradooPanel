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

    let school = []
    var highschool_city = []
    let schoolquery = '00000000-0000-0000-0000-000000000000';

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

    let resultdata = []
    if (usertype == 'Üniversite') {
        let searchstring = ''
        if (school != " ") {
            let splitted = ''
            if (JSON.stringify(school).includes(' ')) {
                splitted = JSON.stringify(school).replaceAll(' ', '& ')
                searchstring = '( ' + searchstring.concat(splitted.replaceAll('"', '').replaceAll('-', ' ') + ' ) ')
            } else { searchstring = '( ' + searchstring.concat(school) + ' ) ' }
        }
        const { data } = await supabase.rpc('indexuniversity', { input: searchstring })
        resultdata = data
    } else {
        const { data } = await supabase.rpc('indexschool', { 'input': school, 'city_input': highschool_city })
        resultdata = data
    }

    let citystring = ''
    if (resultdata !== null) {
        if (resultdata.length > 0) {
            schoolquery = resultdata[0].sid
            citystring = citystring.concat(resultdata[0].city)
        } else {
            citystring = citystring.concat(highschool_city)
        }
    } else {
        citystring = citystring.concat(highschool_city)
    }

    console.log('string - ', searchstring, 'data - ', data)

    // Exceptions - Old format
    if (usertype == 'Lise / Mezun') { usertype = 'Lise' }

    const { error } = await supabase
        .from('users')
        .upsert({
            phone: phone,
            firstname: firstname,
            lastname: lastname,
            email: email,
            usertype: usertype,
            school: schoolquery,
            raw_school_input: school,
            city: citystring,
            class: schoolclass
        })
    console.log('user ', phone)
    if (error) { console.log(error) }

    const { data: currentUser, indexError } = await supabase
        .from('users')
        .select('id, phone')
        .eq('phone', phone)
        .limit(1)
        .single()
    if (indexError) { console.log(indexError) }

    const { applicationUpsertError } = await supabase
        .from('applications_template')
        .insert({
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            email: email,
            event: eventID,
            submitted_at: user.submitted_at,
            class: schoolclass,
            user: currentUser.id
        })
    if (applicationUpsertError) { console.log(applicationUpsertError) }

    console.log(counter, 'User: ', currentUser.id, ' - ', currentUser.phone)
    res.status(200).json({ message: "OK" })
}

export const config = {
    api: {
        bodyParser: false,
    },
}