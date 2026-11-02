const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: "现金",
  SAVINGS: "存储",
  INVESTMENT: "投资",
  DEBT: "负债",
  BANK: "银行卡",
  ALIPAY: "支付宝",
  WECHAT: "微信",
  CREDIT: "信用卡",
  OTHER: "其他",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "股票",
  FUND: "基金",
  PHYSICAL_GOLD: "实物黄金",
  HK_STOCK: "港股",
  US_STOCK: "美股",
  CN_STOCK: "A股",
  CRYPTO: "加密货币",
  BOND: "债券",
  REAL_ESTATE: "房产",
  OTHER: "其他",
};

export function accountTypeLabel(type: string) {
  return ACCOUNT_TYPE_LABELS[type] || type;
}

export function assetTypeLabel(type: string) {
  return ASSET_TYPE_LABELS[type] || type;
}
