import { Line } from "react-chartjs-2";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();

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

        <div className="section settings">
          <img src="/img/db.svg" className="icon" />
          <h2>Settings</h2>
        </div>
      </div>

      <div className="container">
        <div className="header">
          <div className="title">
            <img src="/img/summary2.svg" />
            <h2>Summary</h2>
          </div>
          <div className="profile">
            <h3>user.name</h3>
            <img src="/img/profileicon.svg" />
          </div>
        </div>

        <div className="viewport">
          <div className="graph graph1">
            <canvas id="current">123</canvas>
          </div>
          <div className="graph graph2">
            <canvas id="future"></canvas>
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
