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
      <Sidebar activeMenu={'Summary'}/>

      <div className="container">
        <div className="header">
          <div className="title">
            <img src="/img/summary2.svg" />
            <h2 className="flex items-center text-lg font-medium">Summary</h2>
          </div>
          <div
            className="profile"
            onClick={() => router.push({ pathname: "/account" })}
          >
            <h3 className="flex items-center text-base font-medium">{username}</h3>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="avatar image" />
            ) : (
              <div className="avatar no-image" />
            )}
          </div>
        </div>

        <div className="px-6 text-[.5rem]">
          <Datepicker value={dateValue} onChange={handleValueChange} showShortcuts={true} showFooter={true} inputClassName="rounded-xl text-[.5rem]" />
        </div>

        <div className="viewport">
          <div className="graph graph1">
            <TotalApplications startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>
          <div className="graph graph2">
            <Timeline startDate={''} endDate={''} />
          </div>
          <div className="graph graph3">
            <Temp startDate={dateValue.startDate} endDate={dateValue.endDate} />
          </div>
          <div className="graph graph4">
            <ClassChart type={'highschool'} />
          </div>
          <div className="graph graph5">
            <ClassChart type={'university'} />
          </div>
        </div>
      </div>
    </>
  );
}
