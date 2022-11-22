import { Line } from "react-chartjs-2";
export default function Dashboard() {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Datasaet",
        data: [0, 10, 20, 30, 40, 50, 100],
      },
    ],
  };

  return (
    <div>
      <Line data={data} />
    </div>
  );
}
