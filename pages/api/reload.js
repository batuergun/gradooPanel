import { createClient } from '@supabase/supabase-js'
const https = require("https");

export default async function reload(req, res) {
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

      result.items.forEach(async (user) => {
        var event = eventID;
        var firstname = " ";
        var lastname = " ";
        var phone = " ";
        var email = " ";
        var usertype = " ";
        var school = " ";
        var submitted_at = " ";
        var highschool_city = " ";
        var highschool_class = " ";
        var university_program = " ";
        var university_class = " ";

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
              highschool_class = answer.text;
              break;
            case "university-name":
              school = answer.text;
              break;
            case "university-program":
              university_program = answer.text;
              break;
            case "university-class":
              university_class = answer.text;
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

        const { error } = await supabase
          .from('applications')
          .insert({
            firstname,
            lastname,
            phone,
            email,
            usertype,
            school,
            event,
            submitted_at,
          })
        //console.log(`${firstname}, ${lastname}, ${phone}, ${email}, ${usertype}, ${school}, ${highschool_city}, ${highschool_class}, ${university_program}, ${university_class}, ${eventID}, ${submitted_at}`)
      });

      // Callback if there are more than 1000 submissions
      if (result.items.length >= 1000) {
        let lastSubmission = result.items[999].token;
        saveQuery(formid, lastSubmission);
      }
    });
  }

  deleteTable('applications')
  await saveQuery(process.env.TYPEFORM_ID)

  res.status(200).json('OK')
}

