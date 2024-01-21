import ReactEcharts from "echarts-for-react";
import { useRouter } from "next/router";
import { calculateRewardAmounts } from "../lib/calculateRewardAmounts";

interface RewardAmountsSeries {
  rewardPriceSerie: number[];
  totalPriceSerie: number[];
  opireFeeSerie: number[];
  stripeFeeSerie: number[];
  codeOwnerFeeSerie?: number[];
}

interface AmountsSelected {
  reward: number;
  total: number;
  opireFee: number;
  stripeFee: number;
  codeOwnerFee: number;
}

export function RewardPricingChart({ rewardPriceSelected, isCreatorMemberOfOrganization }: { rewardPriceSelected: number, isCreatorMemberOfOrganization: boolean }) {
  const { locale } = useRouter();
  const i18n = get18n(locale)

  const rewardAmountsSeries = generateRewardAmountsSeries({ rewardPriceSelected, isCreatorMemberOfOrganization })
  const amountsSelected = getSelectedAmounts({ rewardPriceSelected, rewardAmountsSeries });

  const series = getSeries({ i18n, amountsSelected, rewardAmounts: rewardAmountsSeries });
  const legend = getLegend(i18n);

  const rewardSerie = series.find((serie) => serie.name === i18n.reward)
  console.log(rewardSerie)
  const option = getOption({ legend, rewardSerie, series, title: i18n.rewardPricing, xAxisName: i18n.reward })

  return (
    <>
      <ReactEcharts option={option} style={{ height: "500px" }} notMerge={true} />
    </>
  );
}

function getSelectedAmounts({
  rewardPriceSelected,
  rewardAmountsSeries
}: {
  rewardPriceSelected: number;
  rewardAmountsSeries: RewardAmountsSeries;
}): AmountsSelected {
  const index = rewardAmountsSeries.rewardPriceSerie.findIndex((value) => value === rewardPriceSelected);

  return {
    reward: rewardPriceSelected,
    total: rewardAmountsSeries.totalPriceSerie[index],
    opireFee: rewardAmountsSeries.opireFeeSerie[index],
    stripeFee: rewardAmountsSeries.stripeFeeSerie[index],
    codeOwnerFee: rewardAmountsSeries.codeOwnerFeeSerie[index],
  };
}

function generateRewardAmountsSeries({
  rewardPriceSelected,
  isCreatorMemberOfOrganization,
}: {
  rewardPriceSelected: number;
  isCreatorMemberOfOrganization: boolean;
}): RewardAmountsSeries {
  const rewardPriceSerie: number[] = [];
  const totalPriceSerie: number[] = [];
  const opireFeeSerie: number[] = [];
  const stripeFeeSerie: number[] = [];
  const codeOwnerFeeSerie: number[] = [];

  for (let i = Math.round(rewardPriceSelected - 20); i <= Math.round(rewardPriceSelected + 20); i += 0.1) {
    const { total, opireFee, codeOwnerFee, compensatedStripeFee, reward } = calculateRewardAmounts(i, isCreatorMemberOfOrganization);

    rewardPriceSerie.push(reward);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    stripeFeeSerie.push(compensatedStripeFee);
    codeOwnerFeeSerie.push(codeOwnerFee);
  }

  return {
    rewardPriceSerie: Array.from(new Set(rewardPriceSerie)).sort((a, b) => a - b),
    totalPriceSerie: Array.from(new Set(totalPriceSerie)).sort((a, b) => a - b),
    opireFeeSerie: Array.from(new Set(opireFeeSerie)).sort((a, b) => a - b),
    stripeFeeSerie: Array.from(new Set(stripeFeeSerie)).sort((a, b) => a - b),
    codeOwnerFeeSerie: Array.from(new Set(codeOwnerFeeSerie)).sort((a, b) => a - b),
  };
}

function getOption({ title, xAxisName, legend, series, rewardSerie }: { title: string, xAxisName: string, legend: string[], series, rewardSerie }) {
  console.log({
    rewardSerie
  })
  return {
    title: {
      text: title,
    },
    tooltip: {
      trigger: "axis",
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    legend: {
      data: legend,
      type: "scroll",
      bottom: 20,
    },
    grid: {
      containLabel: true, // Ensure the label (including legend) is contained within the grid
      bottom: 50, // Adjust the bottom value to leave space for the legend
      left: 10, // Adjust the left value as needed
      right: 10, // Adjust the right value as needed
    },
    xAxis: {
      // type: 'log',
      name: xAxisName,
      data: rewardSerie.data,
    },
    yAxis: {
      type: "value",
    },
    series,
  }
}

function getSeries({ i18n, amountsSelected, rewardAmounts }: { i18n, amountsSelected: AmountsSelected, rewardAmounts: RewardAmountsSeries }) {
  const series = [];

  series.push({
    data: rewardAmounts.totalPriceSerie,
    type: "line",
    name: i18n.total,
    symbolSize: () => 0,
    itemStyle: {
      color: "#E71BB6",
    },
    markPoint: {
      data: [
        {
          xAxis: 200, // (20 + 20) * 10 // 20 puntos hacia la derecha + 20 puntos hacia la izquierda * 10 (0,1 steps) puntos por cada punto
          yAxis: amountsSelected.total,
          itemStyle: {
            color: "white",
            borderColor: "#E71BB6",
          },
          label: {
            show: true,
          },
          symbol: "circle",
          symbolSize: 10,
          symbolRotate: 180,
        },
      ],
      animation: false,
    },
  });

  series.push({
    data: rewardAmounts.opireFeeSerie,
    type: "line",
    name: i18n.opireFee,
    symbolSize: () => 0,
    itemStyle: {
      color: "#12b886",
    },
    markPoint: {
      data: [
        {
          xAxis: 200, // (20 + 20) * 10 // 20 puntos hacia la derecha + 20 puntos hacia la izquierda * 10 (0,1 steps) puntos por cada punto
          yAxis: amountsSelected.opireFee,
          itemStyle: {
            color: "white",
            borderColor: "#12b886",
          },
          label: {
            show: true,
          },
          symbol: "circle",
          symbolSize: 10,
          symbolRotate: 180,
        },
      ],
      animation: false,
    },
  });

  series.push({
    data: rewardAmounts.rewardPriceSerie,
    type: "line",
    name: i18n.reward,
    symbolSize: () => 0,
    itemStyle: {
      color: "#E7CE1B",
    },
    markPoint: {
      data: [
        {
          xAxis: 200, // (20 + 20) * 10 // 20 puntos hacia la derecha + 20 puntos hacia la izquierda * 10 (0,1 steps) puntos por cada punto
          yAxis: amountsSelected.reward,
          itemStyle: {
            color: "white",
            borderColor: "#E7CE1B",
          },
          label: {
            show: true,
          },
          symbol: "circle",
          symbolSize: 10,
          symbolRotate: 180,
        },
      ],
      animation: false,
    },
    // markArea: {
    //   itemStyle: {
    //     color: "rgba(255, 173, 177, 0.4)",
    //   },
    //   data: [
    //     [
    //       {
    //         xAxis: amountsSelected.reward,
    //         name: i18n.belowMin,
    //       },
    //       {
    //         xAxis: 20,
    //       },
    //     ],
    //   ],
    // },
  });

  series.push({
    data: rewardAmounts.stripeFeeSerie,
    type: "line",
    name: i18n.stripeFee,
    symbolSize: () => 0,
    itemStyle: {
      color: "#635BFF",
    },
    markPoint: {
      data: [
        {
          xAxis: 200, // (20 + 20) * 10 // 20 puntos hacia la derecha + 20 puntos hacia la izquierda * 10 (0,1 steps) puntos por cada punto
          yAxis: amountsSelected.stripeFee,
          itemStyle: {
            color: "white",
            borderColor: "#635BFF",
          },
          label: {
            show: true,
          },
          symbol: "circle",
          symbolSize: 10,
          symbolRotate: 180,
        },
      ],
      animation: false,
    },
  });

  if (amountsSelected.codeOwnerFee !== 0) {
    series.push({
      data: rewardAmounts.codeOwnerFeeSerie,
      type: "line",
      name: i18n.codeOwnerFee,
      symbolSize: () => 0,
      itemStyle: {
        color: "#06C2EC",
      },
      markPoint: {
        data: [
          {
            xAxis: amountsSelected.reward,
            yAxis: amountsSelected.codeOwnerFee,
            itemStyle: {
              color: "white",
              borderColor: "#06C2EC",
            },
            label: {
              show: true,
            },
            symbol: "circle",
            symbolSize: 10,
            symbolRotate: 180,
          },
        ],
        animation: false,
      },
    });
  }

  return series;
}

function getLegend(i18n) {
  const legend = [];

  legend.push(i18n.total);
  legend.push(i18n.reward);
  legend.push(i18n.opireFee);
  legend.push(i18n.codeOwnerFee);
  legend.push(i18n.stripeFee);

  return legend;
}

function get18n(language: string) {
  const en = {
    total: "Total",
    opireFee: "Opire fee",
    codeOwnerFee: "Code Owner fee",
    stripeFee: "Stripe fee",
    reward: "Reward",
    rewardPricing: "Reward pricing",
    isMember: "Are you member of the organization?",
    belowMin: "Below min.",
  };

  const i18n: Record<string, typeof en> = {
    en,
    es: {
      total: "Total",
      opireFee: "Comisión de Opire",
      codeOwnerFee: "Comisión del autor",
      stripeFee: "Comisión de Stripe",
      reward: "Recompensa",
      rewardPricing: "Precio de la recompensa",
      isMember: "¿Eres miembro de la organización?",
      belowMin: "Inválido",
    },
  };

  return i18n[language] ?? en;
}