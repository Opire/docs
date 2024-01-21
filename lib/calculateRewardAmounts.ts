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

export function calculateRewardAmounts(rewardValue: number, isCreatorMemberOfOrganization: boolean) {
    const opireFee = rewardValue * (OPIRE_FEE.percentage / 100);
    const codeOwnerFee = isCreatorMemberOfOrganization ? 0 : rewardValue * (CODE_OWNER_FEE.percentage / 100);
    const rewardValueWithOpireAndCodeOwnerFee = rewardValue + opireFee + codeOwnerFee;
    const total = (rewardValueWithOpireAndCodeOwnerFee + STRIPE_FEE.fixed) / (1 - (STRIPE_FEE.percentage / 100));
    const compensatedStripeFee = total - rewardValueWithOpireAndCodeOwnerFee;

    return {
        total: round(total),
        reward: round(rewardValue),
        compensatedStripeFee: round(compensatedStripeFee),
        opireFee: round(opireFee),
        codeOwnerFee: round(codeOwnerFee),
    };
}

function round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}