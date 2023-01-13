import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Router, useRouter } from "next/router";
import Datepicker from "react-tailwindcss-datepicker";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import Sidebar from '../components/Sidebar'
import TotalApplications from "../components/TotalApplications.js";
import Timeline from "../components/Timeline";
import TimelineV2 from "../components/TimelineV2";
import Intersection from "../components/Intersection"
import ClassChart from "../components/ClassChart"
import Temp from "../components/Temp"

export default function Dashboard(session) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

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

  useEffect(() => {
    getProfile();
    setLoading(false)
  }, [session, dateValue]);

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

  return (
    <>
      <Sidebar activeMenu={'Summary'} />

      <div className="basis-[80%]">

        <div className="h-24 text-inherit flex items-center justify-between flex-wrap px-8">

          <div className="mt-[1vh] !flex text-xl">
            <img src="/img/summary2.svg" className="w-[2.5vw] mr-[1vw] text-[#070707]" />
            <h2 className="flex items-center text-lg font-medium text-fontPrimary">Summary</h2>
          </div>
          <div className="px-[1vw] py-[.35vw] w-[14%] flex flex-wrap !justify-around hover:cursor-pointer bg-[#c9d0d6] rounded-full border-none" onClick={() => router.push({ pathname: "/account" })} >
            <h3 className="flex items-center text-base font-medium text-fontPrimary">{username}</h3>
            {avatarUrl ? (
              <img src={avatarUrl} className="ml-[.8vw] w-[3vw] h-[3vw] rounded-full overflow-hidden object-cover" />
            ) : (
              <div className="avatar no-image" />
            )}
          </div>
        </div>

        <div className="px-8 text-[.5rem]">
          <Datepicker value={dateValue} onChange={handleValueChange} showShortcuts={true} showFooter={true} inputClassName="rounded-xl text-[.5rem]" />
        </div>

        <div className="h-[80vh] p-8 grid grid-cols-6 grid-rows-2 content-around gap-4">

          <div className="rounded-3xl bg-cardBackground shadow-xl p-4 flex items-center justify-center col-start-1 col-span-6 row-start-1">
            <TimelineV2 startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>
          <div className="rounded-3xl bg-cardBackground shadow-xl p-4 flex items-center justify-center col-start-1 col-span-2 row-start-2">
            <TotalApplications startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>
          <div className="rounded-3xl bg-cardBackground shadow-xl p-4 flex items-center justify-center col-start-3 col-span-2 row-start-2">
            <ClassChart type={'highschool'} startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>
          <div className="rounded-3xl bg-cardBackground shadow-xl p-4 flex items-center justify-center col-start-5 col-span-2 row-start-2">
            <ClassChart type={'university'} startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>


        </div>
      </div>
    </>
  );
}
