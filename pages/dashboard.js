import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";


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

import TotalApplications from "../components/TotalApplications.js";
import Timeline from "../components/Timeline";

export default function Dashboard(session) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [events, setEvents] = useState(null);

  useEffect(() => {
    getProfile();
    setLoading(false)
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

  return (
    <>
      <div className="sidebar">
        <h1>Gradoo Panel</h1>
        <img src="/img/divider.svg" className="divider" />
        <div
          className="section summary"
          onClick={() => router.push({ pathname: "/" })}
        >
          <img src="/img/summary.svg" className="icon" />
          <h2>Summary</h2>
        </div>
        <div
          className="section query"
          onClick={() => router.push({ pathname: "/search" })}
        >
          <img src="/img/query.svg" className="icon" />
          <h2>Search</h2>
        </div>

        <div className="section campaigns" campaign-button>
          <img src="/img/summary.svg" className="icon" />
          <h2>Campaigns</h2>
        </div>

        <div className="campaignlist visible" campaign-list>
          <div
            className="campaignelement"
            onClick={() => router.push({ pathname: "/project/1" })}
          >
            Gradoo x Derece Atölyesi
          </div>
          <div
            className="campaignelement"
            onClick={() => router.push({ pathname: "/project/2" })}
          >
            Learn How to Learn: English
          </div>
        </div>

        <div
          className="section settings"
          onClick={() => supabase.auth.signOut()}
        >
          <img src="/img/db.svg" className="icon" />
          <h2>Log Out</h2>
        </div>
      </div>

      <div className="container">
        <div className="header">
          <div className="title">
            <img src="/img/summary2.svg" />
            <h2>Summary</h2>
          </div>
          <div
            className="profile"
            onClick={() => router.push({ pathname: "/account" })}
          >
            <h3>{username}</h3>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="avatar image" />
            ) : (
              <div className="avatar no-image" />
            )}
          </div>
        </div>

        <div className="viewport">
          <div className="graph graph1">
            <TotalApplications />
          </div>
          <div className="graph graph2">
            <Timeline />
          </div>
          <div className="graph graph3">
            <canvas id="usertype"></canvas>
          </div>
          <div className="graph graph4">
            <canvas id="highschool_class"></canvas>
          </div>
          <div className="graph graph5">
            <canvas id="university_class"></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
