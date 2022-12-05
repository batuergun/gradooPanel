import { Bar } from "react-chartjs-2";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function TotalApplications() {
  const supabase = useSupabaseClient();
  const [isLoading, setLoading] = useState(false)
  const [graphdata, setGraphData] = useState(null)
  const [graphoptions, setGraphOptions] = useState(null)

  useEffect(() => {
    setLoading(true)

    var applist = [];
    var timeline = [];
    var graphtimeline = [];
    var timelineintegral = [];
    var eventlabels = []
    var eventdistinct = []
    var eventtotal = []
    var eventlist = []

    // Get time array for query
    function getTimeline() {
      var d = new Date();
      for (var i = -1; i < 14; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        timeline.push(d.toISOString());
      }
      return timeline;
    }
    getTimeline();

    // Get time array for table
    function renderTimeline() {
      var d = new Date();
      for (var i = 13; i > -1; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        graphtimeline.push(`${d.getDate()}`);
      }
      return graphtimeline;
    }
    renderTimeline();

    // Application Count
    const getApplicationCount = async () => {
      for (var i = 0; i < 14; i++) {
        const { data, error1 } = await supabase
          .from("applications")
          .select()
          .gte("submitted_at", timeline[14 - i])
          .lt("submitted_at", timeline[14 - i])
        applist.push(data);
      }
    }
    getApplicationCount()


    // Total Application
    const getTotalApplication = async () => {
      for (var i = 0; i < 14; i++) {
        const { data, error } = await supabase
          .from("applications")
          .select()
          .lt("submitted_at", timeline[13 - i])
        timelineintegral.push(data);
      }
    }
    getTotalApplication()


    // Get distinct events
    const getDistinct = async () => {
      const { data2, error2 } = await supabase.rpc('distinctevent')
      data.forEach(event => {
        eventlist.push({ eventid: event })
      });
    }
    getDistinct()

    // Get event app count
    const getEventApplicationCount = async () => {
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventcount', { eventname: eventlist[i].eventid })
        eventlist[i].total = data;
      }
    }
    getEventApplicationCount()


    // Get event distinct app count
    const getDistinctEventApplicationCount = async () => {
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventdistinctcount', { eventname: eventlist[i].eventid })
        eventlist[i].total = data;
      }
    }
    getDistinctEventApplicationCount()

    // Total unique app value
    const getUniqueApplication = async () => {
      const { data3, error3 } = await supabase.rpc('distinctuser')
      eventlist.push({
        eventid: "Total Unique Applicants",
        distinct: data.length,
      });
    }
    getUniqueApplication()

    for (let i = 0; i < eventlist.length; i++) {
      eventlabels.push(eventlist[i].eventid);
      eventtotal.push(eventlist[i].total - eventlist[i].distinct);
      eventdistinct.push(eventlist[i].distinct);

      var timelinecache = [];
      // Daily application Count
      for (var t = 0; t < 14; t++) {
        async function dailyApplication() {
          const { data, error } = await supabase
            .from('applications')
            .select
            .eq('event', eventlist[i].eventid)
            .gte(timeline[14 - t])
            .lt(timeline[13 - t])
          timelinecache.push(data);
        }
      }

      eventlist[i].timeline = timelinecache;
      eventtimeline.push(eventlist[i].timeline);
    }

    // Get usertype
    const getUserType = async () => {
      const { data, error } = await supabase.rpc('distinctusertype')
      for (var i = 0; i < data.length; i++) {
        userTypes.push(data[i]);
      }
    }
    getUserType()

    // Usertype count
    const getUserTypeCount = async () => {
      for await (let type of userTypes) {
        const { data, error } = await supabase.rpc('usertypecount', { usertypeinput: type })
        userCount.push(data);
      }
    }
    getUserTypeCount()

    // Temporary high-school only
    const getSchool = async () => {
      let highschoolClasses = ['Hazirlik', '9', '10', '11', '12']
      for await (let classid of highschoolClasses) {
        const { data, error } = await supabase.rpc('classcount', { class: classid })
        highschool_class.push(data);
      }
    }
    getSchool()

    setGraphOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    })

    setGraphData({
      labels: eventlabels,
      datasets: [
        {
          label: 'Unique',
          data: eventdistinct,
          backgroundColor: [
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 206, 86, 0.2)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
        {
          label: 'Duplicate',
          data: eventtotal,
          backgroundColor: [
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
          ],
          borderColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        }
      ],
    })

    setLoading(false)
  });

  if (isLoading) return <p>Loading...</p>

  return (
    <>
      <Bar options={graphoptions} data={graphdata} />
    </>
  );
}
