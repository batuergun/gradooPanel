import { createClient } from '@supabase/supabase-js'
const https = require("https");

export default async function reloadapplications(req, res) {
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
            let applicationscache = []

            for await (let user of result.items) {
                var event = eventID;
                var firstname = " ";
                var lastname = " ";
                var phone = " ";
                var email = " ";
                var schoolclass = " ";

                user.answers.forEach((answer) => {
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

                const { data: currentUser, error } = await supabase
                    .from('users')
                    .select('id, phone')
                    .eq('phone', phone)
                    .limit(1)
                    .single()

                applicationscache = [...applicationscache, {
                    firstname: firstname,
                    lastname: lastname,
                    phone: phone,
                    email: email,
                    event: event,
                    submitted_at: user.submitted_at,
                    class: schoolclass,
                    user: currentUser.id
                }]

                console.log(counter, 'User: ', currentUser.id, ' - ', currentUser.phone)
                counter += 1
            }

            const { error } = await supabase
                .from('applications_template')
                .insert(applicationscache)
            console.log(error)

            //Callback if there are more than 1000 submissions
            if (result.items.length >= 1000) {
                let lastSubmission = result.items[999].token;
                saveQuery(formid, lastSubmission);
            }
        });
    }

    // Reload for all campaigns
    // const { data } = await supabase
    //     .from('campaigns')
    //     .select('*')
    // deleteTable('applications')
    // for await (let campaign of data) {
    //     await saveQuery(campaign.typeformID)
    // }

    // Individual reload
    // await saveQuery(req.query.typeformID)

    res.status(200).json('OK')
}

