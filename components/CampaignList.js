import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Line } from "react-chartjs-2";

import Sidebar from '../components/Sidebar'
import Datepicker from "react-tailwindcss-datepicker";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

let graphoptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { datalabels: { display: false, }, legend: { position: "top", }, },
    title: { display: false, text: "Applications timeline", },
    scales: { x: { display: true, title: { display: true, }, }, y: { display: true, title: { display: true, text: "Applications", }, suggestedMin: 0, }, }
}

export default function CampaignList(session) {

    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [campaignList, setCampaignList] = useState([]);
    const [listRender, setListRender] = useState(true)
    const [selectedCampaign, setSelectedCampaign] = useState(null)

    const [dateValue, setDateValue] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const handleValueChange = (dateValue) => {
        setDateValue({
            startDate: dateValue.startDate,
            endDate: dateValue.endDate
        })
    }

    const [graphdata, setgraphdata] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        getProfile();
        getCampaignList()

        async function geteventcount() {
            let r = Math.floor(Math.random() * 255); let g = Math.floor(Math.random() * 255); let b = Math.floor(Math.random() * 255);
            let randomColor = 'rgba(' + r + ',' + g + ',' + b + ',0.9)'

            if (selectedCampaign !== null) {
                var datasetCache = []
                var timelineListCache = []

                const { data, error } = await supabase.rpc('timeline_query', { eventname: selectedCampaign.title, from_input: dateValue.startDate, until_input: dateValue.endDate })

                let submissionCountList = []
                for (const day in data) {
                    if (Object.hasOwnProperty.call(data, day)) {
                        const element = data[day];
                        timelineListCache.push(element.date)
                        submissionCountList.push(element.submission_count)
                    }
                }

                datasetCache = [{
                    label: selectedCampaign.title,
                    data: submissionCountList,
                    fill: false,
                    pointStyle: 'circle',
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    type: 'line',
                    borderColor: randomColor,
                    backgroundColor: randomColor
                }]

                setgraphdata({
                    labels: timelineListCache,
                    datasets: datasetCache,
                })
            }
        }
        geteventcount()

    }, [session, selectedCampaign, dateValue]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) throw new Error("No user");

            let { data, error, status } = await supabase
                .from("profiles")
                .select(`username, avatar_url`)
                .eq("id", user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
                downloadImage(data.avatar_url);
            }
        } catch (error) {
            alert("Error loading user data!");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage
                .from("avatars")
                .download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log("Error downloading image: ", error);
        }
    }

    const getCampaignList = async () => {
        const { data, error } = await supabase
            .from('campaigns')
            .select()
        setCampaignList(data)
    }

    const setCampaign = props => {
        setListRender(false)
        setSelectedCampaign(props)
    }

    function renderCampaignList() {
        return <>
            {campaignList.map((campaign) => (
                <>
                    <div className="rounded-2xl bg-cardBackground p-4 mt-4 text-base hover:brightness-75 cursor-pointer" onClick={() => { setCampaign(campaign) }}>
                        {campaign.title}
                    </div>
                </>

            ))}
        </>
    }

    function campaignPage() {
        return <>
            <div className="rounded-2xl bg-cardBackground p-4 mt-4" >
                {selectedCampaign.title}

                <div className="rounded-xl bg-backgroundPrimary p-2 mt-5 h-[40vh]">
                    <Line options={graphoptions} data={graphdata} />
                </div>

            </div>
        </>
    }

    return <>
        <Sidebar activeMenu={'Campaigns'} />

        <div className="container">
            <div className="header">
                <div className="title">
                    <img src="/img/summary2.svg" />
                    <h2 className="flex items-center text-lg font-medium">Campaigns</h2>
                </div>
                <div className="profile" onClick={() => router.push({ pathname: "/account" })} >
                    <h3 className="flex items-center text-base font-medium">{username}</h3>
                    {avatar_url ? (<> <img src={avatar_url} alt="Avatar" className="avatar image" /> </>) : (<> <div className="avatar no-image" /> </>)}
                </div>
            </div>

            <div className="px-8 text-[.5rem]">
                <Datepicker value={dateValue} onChange={handleValueChange} showShortcuts={true} showFooter={true} inputClassName="rounded-xl text-[.5rem]" />
            </div>

            <div className="px-8">
                {listRender ? <>{renderCampaignList()}</> : <>{campaignPage()}</>}
            </div>



        </div>
    </>
}