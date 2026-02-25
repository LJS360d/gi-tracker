import * as echarts from "echarts";
import { onCleanup, onMount, createEffect } from "solid-js";

type Props = {
  counts: { value: string; count: number }[];
  class?: string;
};

export default function BetChart(props: Props) {
  let el: HTMLDivElement | undefined;

  onMount(() => {
    if (!el) return;
    const chart = echarts.init(el, null, { renderer: "canvas" });
    onCleanup(() => chart.dispose());

    createEffect(() => {
      const counts = props.counts;
      if (!counts.length) {
        chart.setOption({ title: { text: "Nessuna previsione ancora", left: "center", top: "middle", textStyle: { fontSize: 14, color: "#737373" } } }, { notMerge: true });
        return;
      }
      const total = counts.reduce((s, c) => s + c.count, 0);
      const sorted = [...counts].sort((a, b) => b.count - a.count);
      const labels = sorted.map((c) => (c.value === "" ? "(vuoto)" : c.value));
      const percentages = sorted.map((c) => (total ? Math.round((c.count / total) * 100) : 0));

      const bottom = labels.length > 4 ? "22%" : "15%";
      chart.setOption({
        grid: { left: "10%", right: "8%", top: "12%", bottom, containLabel: true },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: {
            color: "#a3a3a3",
            rotate: labels.length > 5 ? 25 : 0,
            interval: 0,
            hideOverlap: false,
          },
          axisLine: { lineStyle: { color: "#525252" } },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          axisLabel: { color: "#a3a3a3", formatter: "{value}%" },
          splitLine: { lineStyle: { color: "#525252", type: "dashed" } },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "line",
            data: percentages,
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            lineStyle: { width: 2, color: "#8b5cf6" },
            itemStyle: { color: "#8b5cf6" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(139, 92, 246, 0.35)" },
                { offset: 1, color: "rgba(139, 92, 246, 0)" },
              ]),
            },
          },
        ],
      }, { notMerge: true });
    });
  });

  return <div
    ref={el}
    class={props.class}
    style={{ width: "100%", height: "100%", "min-height": "120px" }} />;
}
