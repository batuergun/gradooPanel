import { Line } from "react-chartjs-2";
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";

let graphoptions = {
  responsive: true,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      position: "top",
    },
  },
  title: {
    display: false,
    text: "Applications timeline",
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: "Applications",
      },
      suggestedMin: 0,
    },
  }
}

export default function Timeline() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [graphdata, setgraphdata] = useState({
    labels: [],
    datasets: [
      {
        label: 'Unique',
        data: []
      },
      {
        label: 'Duplicate',
        data: []
      }
    ],
  });

  useEffect(() => {

    async function geteventlist() {
      var timeline = []
      var graphtimeline = []

      var d = new Date();
      for (var i = -1; i < 14; i++) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        timeline.push(d.toISOString());
      }

      var d = new Date();
      for (var i = 13; i > -1; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        graphtimeline.push(`${d.getDate()}`);
      }

      //
      let eventlist = []
      const { data } = await supabase.rpc('distinctevent')
      data.forEach(e => {
        eventlist.push({ eventid: e.event })
      });

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventcount', { eventname: eventlist[i].eventid })
        eventlist[i].total = data;
      }

      //
      for (var i = 0; i < eventlist.length; i++) {
        const { data, error } = await supabase.rpc('eventdistinctcount', { eventname: eventlist[i].eventid })
        eventlist[i].distinct = data;
      }

      //
      const getdistinctuser = async () => {
        const { data } = await supabase.rpc('distinctuser')
        eventlist.push({
          eventid: "Total Unique Applicants",
          distinct: data,
        });
      }
      await getdistinctuser()

      //
      let eventlabels = []
      let eventtotal = []
      let eventdistinct = []
      let eventtimeline = []

      for (let i = 0; i < eventlist.length; i++) {
        eventlabels.push(eventlist[i].eventid);
        eventtotal.push(eventlist[i].total - eventlist[i].distinct);
        eventdistinct.push(eventlist[i].distinct);

        var timelinecache = [];
        // Daily application Count
        for (var t = 0; t < 14; t++) {
          const gettimeline = async () => {
            const { data } = await supabase.rpc('eventapplicationcount', { eventname: eventlist[i].eventid, gte: timeline[14 - t], lt: timeline[13 - t] })
            timelinecache.push(data);
          }
          await gettimeline()
        }
        console.log(eventtimeline)
        eventlist[i].timeline = timelinecache;
        eventtimeline.push(eventlist[i].timeline);
      }

      setgraphdata({
        labels: graphtimeline,
        datasets: [
          {
            label: eventlabels[0],
            data: eventtimeline[0],
            borderColor: 'rgba(240, 150, 100, 0.9)',
            backgroundColor: 'rgba(240, 150, 100, 0.9)',
            fill: false,
            pointStyle: 'circle',
            pointRadius: 3,
            pointHoverRadius: 7,
            type: 'line'
          },
          {
            label: eventlabels[1],
            data: eventtimeline[1],
            borderColor: 'rgba(75, 192, 192, 0.9)',
            backgroundColor: 'rgba(75, 192, 192, 0.9)',
            fill: false,
            pointStyle: 'circle',
            pointRadius: 3,
            pointHoverRadius: 7,
            type: 'line'
          }
        ],
      })
    }

    //getApplicationCount(timeline)
    //gettotalapp(timeline)
    geteventlist()



  }, [])

  return (
    <>
      <Line options={graphoptions} data={graphdata} />
    </>
  );
}
