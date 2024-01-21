// Example from https://beta.reactjs.org/learn

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RewardPricingChart } from "./RewardPricingChart";
import { calculateRewardAmounts } from "../lib/calculateRewardAmounts";
import { formatPriceFromUsd } from "../lib/formatPriceFromUsd";

const DEFAULT_PRICE = 100
const MINIMUM_PRICE = 20
const STEP = 0.01

export function RewardCalculator() {
  const { locale } = useRouter();
  const i18n = get18n(locale);

  const [rewardValue, setRewardValue] = useState<number | undefined>(DEFAULT_PRICE);
  const [isMember, setIsMember] = useState<boolean>(true);
  const handleRewardValueChange = (value: number) => setRewardValue(Math.max(value, MINIMUM_PRICE));
  const debouncedRewardValue = useDebounceWithMin({
    value: rewardValue,
    min: MINIMUM_PRICE,
  });
  const { total, opireFee, codeOwnerFee, compensatedStripeFee } = calculateRewardAmounts(debouncedRewardValue, isMember);

  return (
    <>
      <div>
        <div>
          <label htmlFor="reward_price" style={{ marginRight: "8px" }}>
            {i18n.reward}:
          </label>
          <input
            name="reward_price"
            type="number"
            step={STEP}
            min={MINIMUM_PRICE}
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
            name="is_member"
            type="checkbox"
            checked={isMember}
            onChange={(element) => setIsMember(element.target.checked)}
            style={{
              borderRadius: "5px",
              border: "1px solid #ccc",
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

      <RewardPricingChart isCreatorMemberOfOrganization={isMember} rewardPriceSelected={debouncedRewardValue} />
    </>
  );
}

function useDebounceWithMin<T>({
  min,
  value,
  delay,
}: {
  value: number;
  delay?: number;
  min: number;
}): number {
  return useDebounce(Math.max(value, min), delay);
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
    isMember: "Are you member of the organization?",
  };

  const i18n: Record<string, typeof en> = {
    en,
    es: {
      total: "Total",
      opireFee: "Comisión de Opire",
      codeOwnerFee: "Comisión del autor",
      stripeFee: "Comisión de Stripe",
      reward: "Recompensa",
      isMember: "¿Eres miembro de la organización?",
    },
  };

  return i18n[language] ?? en;
}
