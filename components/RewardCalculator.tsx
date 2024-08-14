// Example from https://beta.reactjs.org/learn

import { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { useRouter } from "next/router";

const STRIPE_FEE = {
  fixed: 0.85, // Payments + Stripe Connect Express accounts cost
  percentage: 5.25,
};

const OPIRE_FEE = {
  percentage: 4,
};

const INPUT_REWARD_MAX_VALUE = 5_000;

const CHART_STEP = 1;
const CHART_DEFAULT_MIN_VALUE = 0;
const CHART_DEFAULT_MAX_VALUE = 50.00;

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatPriceFromUsd(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usd);
}

function calculate(rewardValue: number) {
  const opireFee = rewardValue * (OPIRE_FEE.percentage / 100);
  const rewardValueWithFees = rewardValue + opireFee;
  const total = (rewardValueWithFees + STRIPE_FEE.fixed) / (1 - (STRIPE_FEE.percentage / 100));
  const compensatedStripeFee = total - rewardValueWithFees;

  return {
    total: round(total),
    compensatedStripeFee: round(compensatedStripeFee),
    opireFee: round(opireFee),
  };
}

function generateRewardPriceSerie({
  rewardPriceSelected,
  minDefault,
  maxDefault,
  step,
}: {
  rewardPriceSelected: number;
  minDefault: number;
  maxDefault: number;
  step: number;
}): {
  rewardPriceSerie: number[];
  totalPriceSerie: number[];
  opireFeeSerie: number[];
  stripeFeeSerie: number[];
} {
  const min = Math.min(rewardPriceSelected, minDefault, maxDefault);
  const max = Math.max(rewardPriceSelected, minDefault, maxDefault);
  const isRewardPriceSelectedNotIncluded = rewardPriceSelected !== min && rewardPriceSelected !== max;

  const rewardPriceSerie: number[] = [];
  const totalPriceSerie: number[] = [];
  const opireFeeSerie: number[] = [];
  const stripeFeeSerie: number[] = [];

  for (let i = min; i <= max; i += step) {
    const { total, opireFee, compensatedStripeFee } = calculate(i);

    rewardPriceSerie.push(i);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  if (isRewardPriceSelectedNotIncluded) {
    const { total, opireFee, compensatedStripeFee } = calculate(rewardPriceSelected);

    rewardPriceSerie.push(rewardPriceSelected);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  return {
    rewardPriceSerie: Array.from(new Set(rewardPriceSerie)).sort((a, b) => a - b),
    totalPriceSerie: Array.from(new Set(totalPriceSerie)).sort((a, b) => a - b),
    opireFeeSerie: Array.from(new Set(opireFeeSerie)).sort((a, b) => a - b),
    stripeFeeSerie: Array.from(new Set(stripeFeeSerie)).sort((a, b) => a - b),
  };
}

export function RewardCalculator() {
  const { locale } = useRouter();
  const i18n = get18n(locale);

  const [rewardValue, setRewardValue] = useState<number | undefined>(50);
  const handleRewardValueChange = (value: number) => setRewardValue(clamp(value, CHART_DEFAULT_MIN_VALUE, INPUT_REWARD_MAX_VALUE));
  const debouncedRewardValue = useDebounceWithMinMax({
    value: rewardValue ?? CHART_DEFAULT_MIN_VALUE,
    min: CHART_DEFAULT_MIN_VALUE,
    max: INPUT_REWARD_MAX_VALUE,
  });
  const { total, opireFee, compensatedStripeFee } = calculate(debouncedRewardValue);

  const { rewardPriceSerie, totalPriceSerie, opireFeeSerie, stripeFeeSerie } = generateRewardPriceSerie(
    {
      rewardPriceSelected: debouncedRewardValue,
      minDefault: CHART_DEFAULT_MIN_VALUE,
      maxDefault: CHART_DEFAULT_MAX_VALUE,
      step: CHART_STEP,
    }
  );


  function getLeyend() {
    const legend = [];

    legend.push(i18n.total);
    legend.push(i18n.reward);
    legend.push(i18n.opireFee);
    legend.push(i18n.stripeFee);

    return legend;
  }


  function getSeries() {
    const series = [];

    series.push({
      // total price,
      data: totalPriceSerie,
      type: "line",
      name: i18n.total,
      symbolSize: () => 0,
      itemStyle: {
        color: "#E71BB6",
      },
      markPoint: {
        data: [
          {
            xAxis: debouncedRewardValue - CHART_DEFAULT_MIN_VALUE,
            yAxis: total,
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
      // opire fee
      data: opireFeeSerie,
      type: "line",
      name: i18n.opireFee,
      symbolSize: () => 0,
      itemStyle: {
        color: "#12b886",
      },
      markPoint: {
        data: [
          {
            xAxis: debouncedRewardValue - CHART_DEFAULT_MIN_VALUE,
            yAxis: opireFee,
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
      // reward price,
      data: rewardPriceSerie,
      type: "line",
      name: i18n.reward,
      symbolSize: () => 0,
      itemStyle: {
        color: "#E7CE1B",
      },
      markPoint: {
        data: [
          {
            xAxis: debouncedRewardValue - CHART_DEFAULT_MIN_VALUE,
            yAxis: debouncedRewardValue,

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
      markArea: {
        itemStyle: {
          color: "rgba(255, 173, 177, 0.4)",
        },
        data: [
          [
            {
              xAxis: 0,
              name: i18n.belowMin,
            },
            {
              xAxis: 20,
            },
          ],
        ],
      },
    });

    series.push({
      // stripe fee,
      data: stripeFeeSerie,
      type: "line",
      name: i18n.stripeFee,
      symbolSize: () => 0,
      itemStyle: {
        color: "#635BFF",
      },
      markPoint: {
        data: [
          {
            xAxis: debouncedRewardValue - CHART_DEFAULT_MIN_VALUE,
            yAxis: compensatedStripeFee,

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

    return series;
  }

  const option = {
    title: {
      text: i18n.rewardPricing,
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
      data: getLeyend(),
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
      name: i18n.reward,
      data: rewardPriceSerie,
    },
    yAxis: {
      type: "value",
    },
    series: getSeries(),
  };

  return (
    <>
      <div>
        <div>
          <label htmlFor="reward_price" style={{ marginRight: "8px" }}>
            {i18n.reward}:
          </label>
          <input
            id="reward_price"
            name="reward_price"
            type="number"
            step={CHART_STEP}
            min={CHART_DEFAULT_MIN_VALUE}
            max={INPUT_REWARD_MAX_VALUE}
            value={rewardValue ?? ""}
            onChange={(element) =>
              element.target.value
                ? handleRewardValueChange(+element.target.value)
                : setRewardValue(undefined)
            }
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              color: "#E7CE1B",
            }}
          />
        </div>

        <br />
        <br />

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "8px", textAlign: "center" }}>
              {i18n.total}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                color: "#E71BB6",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {formatPriceFromUsd(total)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "8px", textAlign: "center" }}>
              {i18n.opireFee}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                color: "#12b886",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {formatPriceFromUsd(opireFee)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "8px", textAlign: "center" }}>
              {i18n.stripeFee}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                color: "#635BFF",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {formatPriceFromUsd(compensatedStripeFee)}
            </span>
          </div>
        </div>
      </div>

      <br />
      <br />

      <ReactEcharts option={option} style={{ height: "500px" }} />
    </>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function useDebounceWithMinMax<T>({
  max,
  min,
  value,
  delay,
}: {
  value: number;
  delay?: number;
  min: number;
  max: number;
}): number {
  return useDebounce(clamp(value, min, max), delay);
}

function useDebounce<T>(value: T, delay = 200): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function get18n(language: string) {
  const en = {
    total: "Total",
    opireFee: "Opire fee",
    stripeFee: "Stripe fee",
    reward: "Reward",
    rewardPricing: "Reward pricing",
    belowMin: "Below min.",
  };

  const i18n: Record<string, typeof en> = {
    en,
    es: {
      total: "Total",
      opireFee: "Comisión de Opire",
      stripeFee: "Comisión de Stripe",
      reward: "Recompensa",
      rewardPricing: "Precio de la recompensa",
      belowMin: "Inválido",
    },
    pt: {
      total: "Total",
      opireFee: "Taxa da Opire",
      stripeFee: "Taxa da Stripe",
      reward: "Recompensa",
      rewardPricing: "Preço da Recompensa",
      belowMin: "Abaixo do mínimo"
    },
    fr: {
      total: "Total",
      opireFee: "Frais Opire",
      stripeFee: "Frais Stripe",
      reward: "Récompense",
      rewardPricing: "Tarification de la Récompense",
      belowMin: "Sous le minimum"
    },
    de: {
      total: "Gesamt",
      opireFee: "Opire Gebühr",
      stripeFee: "Stripe Gebühr",
      reward: "Belohnung",
      rewardPricing: "Belohnungspreisgestaltung",
      belowMin: "Unter dem Minimum"
    },
    zh: {
      total: "总计",
      opireFee: "Opire费用",
      stripeFee: "Stripe费用",
      reward: "奖励",
      rewardPricing: "奖励定价",
      belowMin: "低于最低限额",
    }
  };

  return i18n[language] ?? en;
}
