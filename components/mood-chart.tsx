"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { MOODS } from "@/lib/data";
import type { CheckIn } from "@/lib/store";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const fmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

export function MoodChart({ checkins }: { checkins: CheckIn[] }) {
  const labels = checkins.map((c) => fmt.format(new Date(c.date + "T12:00:00")));
  return (
    <div className="relative h-64 w-full">
      <Line
        aria-label="Line chart of mood, stress and sleep for each check-in"
        role="img"
        data={{
          labels,
          datasets: [
            {
              label: "Mood",
              data: checkins.map((c) => MOODS[c.mood].score),
              borderColor: "#9b3fd8",
              backgroundColor: "#9b3fd8",
              cubicInterpolationMode: "monotone",
              pointRadius: 4,
              yAxisID: "y",
            },
            {
              label: "Stress",
              data: checkins.map((c) => c.stress),
              borderColor: "#e0596d",
              backgroundColor: "#e0596d",
              borderDash: [6, 4],
              cubicInterpolationMode: "monotone",
              pointRadius: 3,
              yAxisID: "y",
            },
            {
              label: "Sleep (hrs)",
              data: checkins.map((c) => c.sleepHours),
              borderColor: "#3b8fd9",
              backgroundColor: "rgba(59,143,217,0.12)",
              fill: true,
              cubicInterpolationMode: "monotone",
              pointRadius: 2,
              yAxisID: "sleep",
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, font: { weight: "bold" } } },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const c = checkins[ctx.dataIndex];
                  if (ctx.dataset.label === "Mood") return ` Mood: ${MOODS[c.mood].emoji} ${MOODS[c.mood].label}`;
                  if (ctx.dataset.label === "Stress") return ` Stress: ${c.stress} / 5`;
                  return ` Sleep: ${c.sleepHours} hrs`;
                },
              },
            },
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              min: 0,
              max: 5.5,
              ticks: { stepSize: 1, callback: (v) => (Number(v) >= 1 && Number(v) <= 5 ? v : "") },
              title: { display: true, text: "Mood / Stress (1–5)" },
              grid: { color: "#efe9f8" },
            },
            sleep: {
              position: "right",
              min: 0,
              max: 12,
              title: { display: true, text: "Sleep hrs" },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
}
