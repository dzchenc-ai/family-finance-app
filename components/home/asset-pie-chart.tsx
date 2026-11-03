"use client";

import React from "react";
import ReactECharts from "echarts-for-react";

interface AssetPieChartProps {
  data: { name: string; value: number }[];
}

const PALETTE = ["#1f5c4a", "#c4a574", "#3e5160", "#b56b52", "#7f8f86", "#d8c7a4", "#6d7d55"];

export function AssetPieChart({ data }: AssetPieChartProps) {
  const option = {
    color: PALETTE,
    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>¥{c} · {d}%",
      backgroundColor: "#fbfaf7",
      borderColor: "#e6e1d8",
      textStyle: { color: "#1c2b26", fontSize: 12 },
    },
    legend: {
      bottom: 0,
      left: "center",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: "#5c675f", fontSize: 12 },
    },
    series: [
      {
        name: "资产分布",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: "#fbfaf7",
          borderWidth: 2,
        },
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  };

  return (
    <div className="h-[240px] w-full">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
