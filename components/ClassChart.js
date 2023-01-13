import { React, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js'
import { Bar } from "react-chartjs-2";

let graphoptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
}

export default function ClassChart(options) {

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const [hs_graphdata, hs_setgraphdata] = useState({
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

    const [u_graphdata, u_setgraphdata] = useState({
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
        async function getClassData() {
            const { data } = await supabase.rpc('classinfo_by_time', {from_input: options.startDate, until_input: options.endDate})

            let highschoollist = { 9: 0, 10: 0, 11: 0, 12: 0, 'mezun': 0, 'hazirlik': 0 }
            let universitylist = { 1: 0, 2: 0, 3: 0, 4: 0, 'hazirlik': 0 }

            data.forEach(row => {
                if (row.usertype === 'Üniversite') {
                    switch (row.class) {
                        case "1. sınıf": universitylist['1'] = row.count; break;
                        case "2. sınıf": universitylist['2'] = row.count; break;
                        case "3. sınıf": universitylist['3'] = row.count; break;
                        case "4. sınıf": universitylist['4'] = row.count; break;
                        case "Hazırlık": universitylist['hazirlik'] = row.count; break;
                        default: break;
                    }
                } else if (row.usertype === "Lise / Mezun") {
                    switch (row.class) {
                        case "9": highschoollist['9'] = row.count; break;
                        case "10": highschoollist['10'] = row.count; break;
                        case "11": highschoollist['11'] = row.count; break;
                        case "12": highschoollist['12'] = row.count; break;
                        case "Mezun": highschoollist['mezun'] = row.count; break;
                        case "Hazırlık": highschoollist['hazirlik'] = row.count; break;
                        default: break;
                    }
                }
            });

            hs_setgraphdata({
                labels: ['9', '10', '11', '12', 'Mezun', 'Hazirlik'],
                datasets: [
                    {
                        label: 'High School',
                        data: [highschoollist['9'], highschoollist['10'], highschoollist['11'], highschoollist['12'], highschoollist['mezun'], highschoollist['hazirlik']],
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
                    }
                ],
            })

            u_setgraphdata({
                labels: ['1', '2', '3', '4', 'Hazirlik'],
                datasets: [
                    {
                        label: 'University',
                        data: [universitylist['1'], universitylist['2'], universitylist['3'], universitylist['4'], universitylist['hazirlik']],
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
                    }
                ],
            })
        }
        getClassData()
    }, [options])

    if (options.type === 'university') {
        return (
            <>
                <Bar options={graphoptions} data={u_graphdata} />
            </>
        )
    } else {
        return (
            <>
                <Bar options={graphoptions} data={hs_graphdata} />
            </>
        )
    }

}

