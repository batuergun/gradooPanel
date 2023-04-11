import { Line } from "react-chartjs-2";
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";

let graphoptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { datalabels: { display: false, }, legend: { position: "top", }, },
    title: { display: false, text: "Applications timeline", },
    scales: { x: { display: true, title: { display: true, }, }, y: { display: true, title: { display: true, text: "Applications", }, suggestedMin: 0, }, }
}

export default function TimelineV2(dateValue) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const [campaignList, setCampaignList] = useState([]);
    const [timelineList, setTimeline] = useState([])
    const [datasetList, setDatasetList] = useState([])

    const [reload, setReload] = useState(false)

    const [graphdata, setgraphdata] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {

        async function getCampaignList() {
            const { data, error } = await supabase
                .from('campaigns')
                .select()
            setCampaignList(data)
        }

        async function geteventcount() {

            await getCampaignList()

            if (campaignList.length > 0) {
                var datasetListCache = []
                var timelineListCache = []

                for (const campaign in campaignList) {
                    if (Object.hasOwnProperty.call(campaignList, campaign)) {
                        const element = campaignList[campaign];

                        const { data, error } = await supabase.rpc('timeline_query', { eventname: element.title, from_input: dateValue.startDate, until_input: dateValue.endDate })

                        let submissionCountList = []
                        let applicationTotal = 0

                        if (element.id == 1) {
                            data.forEach(day => { timelineListCache.push(day.date) })
                            //setTimeline(timelineListCache)
                        }

                        data.forEach(day => {
                            applicationTotal += day.submission_count
                            submissionCountList.push(day.submission_count)
                        })

                        if (applicationTotal > 0) {
                            datasetListCache.push({
                                label: element.title,
                                data: submissionCountList,
                                fill: false,
                                pointStyle: 'circle',
                                pointRadius: 3,
                                pointHoverRadius: 7,
                                type: 'line',
                                borderColor: element.themeColor,
                                backgroundColor: element.themeColor
                            })
                        }

                    }
                }

                setgraphdata({
                    labels: timelineListCache,
                    datasets: datasetListCache,
                })

            }
        }
        geteventcount()

    }, [dateValue])

    return (
        <>
            <Line options={graphoptions} data={graphdata} />
        </>
    );
}
