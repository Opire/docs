// Example from https://beta.reactjs.org/learn

import { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { useRouter } from "next/router";

const STRIPE_FEE = {
  fixed: 0.35,
  percentage: 5.25,
};

const OPIRE_FEE = {
  percentage: 20,
};

const INPUT_TIP_MAX_VALUE = 2_000;

const CHART_STEP = 1;
const CHART_DEFAULT_MIN_VALUE = 0;
const CHART_DEFAULT_MAX_VALUE = 20.00;

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

function calculate(tipValue: number) {
  const opireFee = tipValue * (OPIRE_FEE.percentage / 100);
  const tipValueWithOpireFee = tipValue + opireFee;
  const total = (tipValueWithOpireFee + STRIPE_FEE.fixed) / (1 - (STRIPE_FEE.percentage / 100));
  const compensatedStripeFee = total - tipValueWithOpireFee;

  return {
    total: round(total),
    compensatedStripeFee: round(compensatedStripeFee),
    opireFee: round(opireFee),
  };
}

function generateTipPriceSerie(
  tipPriceSelected: number,
  minDefault: number,
  maxDefault: number,
  step: number
): {
  tipPriceSerie: number[];
  totalPriceSerie: number[];
  opireFeeSerie: number[];
  stripeFeeSerie: number[];
} {
  const min = Math.min(tipPriceSelected, minDefault, maxDefault);
  const max = Math.max(tipPriceSelected, minDefault, maxDefault);
  const isTipPriceSelectedNotIncluded = tipPriceSelected !== min && tipPriceSelected !== max;

  const tipPriceSerie: number[] = [];
  const totalPriceSerie: number[] = [];
  const opireFeeSerie: number[] = [];
  const stripeFeeSerie: number[] = [];

  for (let i = min; i <= max; i += step) {
    const { total, opireFee, compensatedStripeFee } = calculate(i);

    tipPriceSerie.push(i);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  if (isTipPriceSelectedNotIncluded) {
    const { total, opireFee, compensatedStripeFee } = calculate(tipPriceSelected);

    tipPriceSerie.push(tipPriceSelected);
    totalPriceSerie.push(total);
    opireFeeSerie.push(opireFee);
    stripeFeeSerie.push(compensatedStripeFee);
  }

  return {
    tipPriceSerie: Array.from(new Set(tipPriceSerie)).sort((a, b) => a - b),
    totalPriceSerie: Array.from(new Set(totalPriceSerie)).sort((a, b) => a - b),
    opireFeeSerie: Array.from(new Set(opireFeeSerie)).sort((a, b) => a - b),
    stripeFeeSerie: Array.from(new Set(stripeFeeSerie)).sort((a, b) => a - b),
  };
}

export function TipCalculator() {
  const { locale } = useRouter();
  const i18n = get18n(locale);

  const [tipValue, setTipValue] = useState<number | undefined>(5);
  const handleTipValueChange = (value: number) => setTipValue(clamp(value, CHART_DEFAULT_MIN_VALUE, INPUT_TIP_MAX_VALUE));
  const debouncedTipValue = useDebounceWithMinMax({
    value: tipValue ?? CHART_DEFAULT_MIN_VALUE,
    min: CHART_DEFAULT_MIN_VALUE,
    max: INPUT_TIP_MAX_VALUE,
  });
  const { total, opireFee, compensatedStripeFee } = calculate(debouncedTipValue);

  const { tipPriceSerie, totalPriceSerie, opireFeeSerie, stripeFeeSerie } = generateTipPriceSerie(
      debouncedTipValue,
      CHART_DEFAULT_MIN_VALUE,
      CHART_DEFAULT_MAX_VALUE,
      CHART_STEP
    );

  const option = {
    title: {
      text: i18n.tipPricing,
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
      data: [i18n.total, i18n.tip, i18n.opireFee, i18n.stripeFee],
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
      name: i18n.tip,
      data: tipPriceSerie,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
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
              xAxis: debouncedTipValue - CHART_DEFAULT_MIN_VALUE,
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
      },
      {
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
              xAxis: debouncedTipValue - CHART_DEFAULT_MIN_VALUE,
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
      },
      {
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
              xAxis: debouncedTipValue - CHART_DEFAULT_MIN_VALUE,
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
      },
      {
        // tip price,
        data: tipPriceSerie,
        type: "line",
        name: i18n.tip,
        symbolSize: () => 0,
        itemStyle: {
          color: "#E7CE1B",
        },
        markPoint: {
          data: [
            {
              xAxis: debouncedTipValue - CHART_DEFAULT_MIN_VALUE,
              yAxis: debouncedTipValue,

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
      },
    ],
  };

  return (
    <>
      <div>
        <label htmlFor="tip_price" style={{ marginRight: "8px" }}>
          {i18n.tip}:
        </label>
        <input
          name="tip_price"
          type="number"
          step={CHART_STEP}
          min={CHART_DEFAULT_MIN_VALUE}
          max={INPUT_TIP_MAX_VALUE}
          value={tipValue ?? ""}
          onChange={(element) =>
            element.target.value
              ? handleTipValueChange(+element.target.value)
              : setTipValue(undefined)
          }
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            color: "#E7CE1B",
          }}
        />

        <br />
        <br />

        <div
          style={{
            display: "flex",
            gap: "1rem",
            gridTemplateColumns: "repeat(3, 1fr)",
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
    tip: "Tip",
    tipPricing: "Tip pricing",
  };

  const i18n: Record<string, typeof en> = {
    en,
    es: {
      total: "Total",
      opireFee: "Comisión de Opire",
      stripeFee: "Comisión de Stripe",
      tip: "Propina",
      tipPricing: "Precio de la propina",
    },
  };

  return i18n[language] ?? en;
}
