// Example from https://beta.reactjs.org/learn

import { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { useRouter } from "next/router";

const STRIPE_FEE = {
  fixed: 0.35,
  percentage: 5.25,
};

const OPIRE_FEE = {
  percentage: 10,
};

const CODE_OWNER_FEE = {
  percentage: 5,
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

function calculate(rewardValue: number, isCreatorMemberOfOrganization: boolean) {
  const opireFee = rewardValue * (OPIRE_FEE.percentage / 100);
  const codeOwnerFee = isCreatorMemberOfOrganization ? 0 : rewardValue * (CODE_OWNER_FEE.percentage / 100);
  const rewardValueWithOpireAndCodeOwnerFee = rewardValue + opireFee + codeOwnerFee;
  const total = (rewardValueWithOpireAndCodeOwnerFee + STRIPE_FEE.fixed) / (1 - (STRIPE_FEE.percentage / 100));
  const compensatedStripeFee = total - rewardValueWithOpireAndCodeOwnerFee;

  return {
    total: round(total),
    compensatedStripeFee: round(compensatedStripeFee),
    opireFee: round(opireFee),
    codeOwnerFee: round(codeOwnerFee),
  };
}

function generateRewardPriceSerie({
  isCreatorMemberOfOrganization,
  rewardPriceSelected,
  minDefault,
  maxDefault,
  step,
}: {
  isCreatorMemberOfOrganization: boolean;
  rewardPriceSelected: number;
  minDefault: number;
  maxDefault: number;
  step: number;
}): {
  rewardPriceSerie: number[];
  totalPriceSerie: number[];
  opireFeeSerie: number[];
  codeOwnerFeeSerie: number[];
  stripeFeeSerie: number[];
} {
  const min = Math.min(rewardPriceSelected, minDefault, maxDefault);
  const max = Math.max(rewardPriceSelected, minDefault, maxDefault);
  const isRewardPriceSelectedNotIncluded = rewardPriceSelected !== min && rewardPriceSelected !== max;

  const rewardPriceSerie: number[] = [];
  const totalPriceSerie: number[] = [];
  const opireFeeSerie: number[] = [];
  const codeOwnerFeeSerie: number[] = [];
  const stripeFeeSerie: number[] = [];

  for (let i = min; i <= max; i += step) {
    const { total, opireFee, codeOwnerFee, compensatedStripeFee } = calculate(i, isCreatorMemberOfOrganization);

    rewardPriceSerie.push(i);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    codeOwnerFeeSerie.push(codeOwnerFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  if (isRewardPriceSelectedNotIncluded) {
    const { total, opireFee, codeOwnerFee, compensatedStripeFee } = calculate(rewardPriceSelected, isCreatorMemberOfOrganization);

    rewardPriceSerie.push(rewardPriceSelected);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    codeOwnerFeeSerie.push(codeOwnerFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  return {
    rewardPriceSerie: Array.from(new Set(rewardPriceSerie)).sort((a, b) => a - b),
    totalPriceSerie: Array.from(new Set(totalPriceSerie)).sort((a, b) => a - b),
    opireFeeSerie: Array.from(new Set(opireFeeSerie)).sort((a, b) => a - b),
    codeOwnerFeeSerie: Array.from(new Set(codeOwnerFeeSerie)).sort((a, b) => a - b),
    stripeFeeSerie: Array.from(new Set(stripeFeeSerie)).sort((a, b) => a - b),
  };
}

export function RewardCalculator() {
  const { locale } = useRouter();
  const i18n = get18n(locale);

  const [rewardValue, setRewardValue] = useState<number | undefined>(50);
  const [isMember, setIsMember] = useState<boolean>(true);
  const handleRewardValueChange = (value: number) => setRewardValue(clamp(value, CHART_DEFAULT_MIN_VALUE, INPUT_REWARD_MAX_VALUE));
  const debouncedRewardValue = useDebounceWithMinMax({
    value: rewardValue ?? CHART_DEFAULT_MIN_VALUE,
    min: CHART_DEFAULT_MIN_VALUE,
    max: INPUT_REWARD_MAX_VALUE,
  });
  const { total, opireFee, codeOwnerFee, compensatedStripeFee } = calculate(debouncedRewardValue, isMember);

  const { rewardPriceSerie, totalPriceSerie, opireFeeSerie, codeOwnerFeeSerie, stripeFeeSerie } = generateRewardPriceSerie(
    {
      isCreatorMemberOfOrganization: isMember,
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
    legend.push(i18n.codeOwnerFee);
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

    series.push({
      // code owner fee
      data: codeOwnerFeeSerie,
      type: "line",
      name: i18n.codeOwnerFee,
      symbolSize: () => 0,
      itemStyle: {
        color: "#06C2EC",
      },
      markPoint: {
        data: [
          {
            xAxis: debouncedRewardValue - CHART_DEFAULT_MIN_VALUE,
            yAxis: codeOwnerFee,
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

        <div style={{ display: "flex", alignItems: "center" }}>
          <label htmlFor="is_member" style={{ marginRight: "8px" }}>
            {i18n.isMember}
          </label>
          <input
            id="is_member"
            name="is_member"
            type="checkbox"
            checked={isMember}
            onChange={(element) => setIsMember(element.target.checked)}
            style={{
              borderRadius: "5px",
              // border: "none",
              border: "1px solid #ccc",
              // outline: '1px solid #ccc',
              // MozOutlineRadius: '5px',
              color: "#E7CE1B",
              width: "20px",
              height: "20px",
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
              {i18n.codeOwnerFee}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                color: "#06C2EC",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {formatPriceFromUsd(codeOwnerFee)}
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
