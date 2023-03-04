import { createClient } from '@supabase/supabase-js'
const https = require("https");

export default async function reloadusers(req, res) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    async function request(options, onResult) {
        let output = "";
        const req = https.request(options, (res) => {
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                output += chunk;
            });
            res.on("end", () => {
                let obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            });
        });

        req.on("error", (err) => {
            console.log(err);
        });

        req.end();
    };

    async function deleteTable(table) {
        const { error } = await supabase
            .from(table)
            .delete()
            .lt('id', 100000)
    }

    async function saveQuery(formid, before) {
        // Retrieve fieldID's for contact info
        var firstnameID = "";
        var lastnameID = "";
        var phonenumberID = "";
        var emailID = "";
        var eventID = "";

        // Get title
        const formconfig = {
            hostname: "api.typeform.com",
            port: 443,
            path: `/forms/${formid}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.TYPEFORM_TOKEN}`,
                "Content-Type": "application/json",
            },
        };

        await request(formconfig, (statusCode, result) => {
            eventID = result.title;
            result.fields[0].properties.fields.forEach((field) => {
                if (field.subfield_key === "first_name") firstnameID = field.id;
                if (field.subfield_key === "last_name") lastnameID = field.id;
                if (field.subfield_key === "phone_number") phonenumberID = field.id;
                if (field.subfield_key === "email") emailID = field.id;
            });
        });

        var searchKey = ``;
        if (before !== undefined) {
            searchKey = `&before=${before}`;
        }

        const queryoptions = {
            hostname: "api.typeform.com",
            port: 443,
            path: `/forms/${formid}/responses?completed=true&page_size=1000${searchKey}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.TYPEFORM_TOKEN}`,
                "Content-Type": "application/json",
            },
        };

        await request(queryoptions, async (statusCode, result) => {
            let counter = 0
            let usercache = []

            for await (let user of result.items) {
                var event = eventID;
                var firstname = " ";
                var lastname = " ";
                var phone = " ";
                var email = " ";
                var usertype = " ";
                var submitted_at = " ";
                var highschool_city = " ";
                var university_program = " ";
                var schoolclass = " ";

                let school = []
                var highschool_city = []
                var schoolquery = " ";

                submitted_at = user.submitted_at;

                user.answers.forEach((answer) => {
                    switch (answer.field.ref) {
                        case "usertype":
                            usertype = answer.choice.label;
                            break;
                        case "highschool-name":
                            school = answer.text;
                            break;
                        case "highschool-city":
                            highschool_city = answer.text;
                            break;
                        case "highschool-class":
                            schoolclass = answer.text;
                            break;
                        case "university-name":
                            school = answer.text;
                            break;
                        case "university-program":
                            university_program = answer.text;
                            break;
                        case "university-class":
                            schoolclass = answer.text;
                            break;
                    }
                    switch (answer.field.id) {
                        case firstnameID:
                            firstname = answer.text;
                            break;
                        case lastnameID:
                            lastname = answer.text;
                            break;
                        case phonenumberID:
                            phone = answer.phone_number;
                            break;
                        case emailID:
                            email = answer.email;
                            break;
                    }
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
                        schoolquery = resultdata[0].name
                        citystring = citystring.concat(resultdata[0].city)
                    } else {
                        citystring = citystring.concat(highschool_city)
                    }
                } else {
                    citystring = citystring.concat(highschool_city)
                }

                // Exceptions - Old format
                if (usertype == 'Lise / Mezun') { usertype = 'Lise' }

                if (typeof schoolquery != null && schoolquery.length > 0) {
                    const { error } = await supabase
                        .from('users')
                        .upsert({
                            phone: phone,
                            firstname: firstname,
                            lastname: lastname,
                            email: email,
                            usertype: usertype,
                            school: schoolquery,
                            city: citystring,
                            class: schoolclass
                        })
                    console.log('user ', phone)
                    if (error) { console.log(error) }
                }
                counter += 1
            }

            //Callback if there are more than 1000 submissions
            if (result.items.length >= 1000) {
                let lastSubmission = result.items[999].token;
                saveQuery(formid, lastSubmission);
            }
        });
    }

    // Reload for all campaigns
    // const { data } = await supabase
    //   .from('campaigns')
    //   .select('*')

    //deleteTable('applications')
    // for await (let campaign of data) {
    //   await saveQuery(campaign.typeformID)
    // }

    // Individual reload
    // await saveQuery(req.query.typeformID)

    res.status(200).json('OK')
}

