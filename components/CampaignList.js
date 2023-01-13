import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

import Sidebar from '../components/Sidebar'

export default function CampaignList(session) {

    const supabase = useSupabaseClient();
    const user = useUser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);

    const [campaignList, setCampaignList] = useState([]);
    const [listRender, setListRender] = useState(true)
    const [selectedCampaign, setSelectedCampaign] = useState({})

    useEffect(() => {
        getProfile();
        getCampaignList()

    }, [session]);

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

        console.log(data)
        setCampaignList(data)
    }

    const setCampaign = props => {
        console.log(props)
        setListRender(false)
        setSelectedCampaign(props)
    }

    function renderCampaignList() {
        return <>
            {campaignList.map((campaign) => (
                <>
                    <div className="rounded-2xl bg-cardBackground p-5 m-4 hover:brightness-75 cursor-pointer" onClick={() => { setCampaign(campaign) }}>
                        {campaign.title}
                    </div>
                </>

            ))}
        </>
    }

    function campaignPage() {
        return <>
            {selectedCampaign.title}
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

            {listRender ? <>{renderCampaignList()}</> : <>{campaignPage()}</>}


        </div>
    </>
}