import { Line } from "react-chartjs-2";
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";

let graphoptions = {
    responsive: true,
    maintainAspectRatio: false,
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

export default function TimelineV2(dateValue) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const [campaignList, setCampaignList] = useState([]);
    const [timelineList, setTimeline] = useState([])
    const [datasetList, setDatasetList] = useState([])

    const [graphdata, setgraphdata] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {

        async function geteventlist() {
            const { data, error } = await supabase
                .from('campaigns')
                .select()
            setCampaignList(data)
        }

        async function geteventcount() {
            await geteventlist()

            if (campaignList.length > 0) {

                var datasetListCache = []

                campaignList.forEach(async campaign => {
                    const { data, error } = await supabase.rpc('timeline_query', { eventname: campaign.title, from_input: dateValue.startDate, until_input: dateValue.endDate })

                    if (campaign.id == 1) {
                        var timelineListCache = []
                        data.forEach(day => { timelineList.push(day.date) })
                        setTimeline(timelineListCache)
                    }

                    let submissionCountList = []
                    data.forEach(day => { submissionCountList.push(day.submission_count) })

                    let r = Math.floor(Math.random() * 255); let g = Math.floor(Math.random() * 255); let b = Math.floor(Math.random() * 255);
                    let randomColor = 'rgba(' + r + ',' + g + ',' + b + ',0.9)'

                    datasetListCache.push({
                        label: campaign.title,
                        data: submissionCountList,
                        fill: false,
                        pointStyle: 'circle',
                        pointRadius: 3,
                        pointHoverRadius: 7,
                        type: 'line',
                        borderColor: randomColor,
                        backgroundColor: randomColor
                    })
                    console.log(datasetListCache)
                });

                setDatasetList(datasetListCache)
            }

            setgraphdata({
                labels: timelineList,
                datasets: datasetList,
            })
        }
        geteventcount()

    }, [dateValue])

    return (
        <>
            <Line options={graphoptions} data={graphdata} />
        </>
    );
}
