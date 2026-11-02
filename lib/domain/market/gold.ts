import { getSystemSettingInternal } from "@/lib/domain/system-settings";

export async function fetchGoldPrice() {
  const appkey = await getSystemSettingInternal("k780_appkey");
  const sign = await getSystemSettingInternal("k780_sign");

  if (!appkey || !sign) {
    return {
      success: false as const,
      message: "API configuration missing. Please configure AppKey and Sign in settings.",
    };
  }

  const url = "http://api.k780.com";
  const params = new URLSearchParams({
    app: "finance.gold_price",
    goldid: "1053",
    appkey: appkey,
    sign: sign,
    format: "json",
  });

  const fullUrl = `${url}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(fullUrl, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success !== "0") {
      let price = null;
      if (data.result && data.result.dtList && data.result.dtList["1053"]) {
        price = data.result.dtList["1053"].last_price;
      }

      return {
        success: true as const,
        price: price as string | null,
        result: data.result,
      };
    }

    return {
      success: false as const,
      message: `${data.msgid} ${data.msg}`,
    };
  } catch (error: any) {
    console.error("Error fetching gold price:", error);
    return {
      success: false as const,
      message: error.message as string,
    };
  }
}
