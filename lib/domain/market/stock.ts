import { getSystemSettingInternal } from "@/lib/domain/system-settings";

export async function fetchStockPrice(symbol: string) {
  let apiSymbol = symbol.toLowerCase();

  if (apiSymbol.endsWith(".hk")) {
    apiSymbol = apiSymbol.replace(".hk", "");
  }

  if (/^\d+$/.test(apiSymbol)) {
    const paddedSymbol = apiSymbol.padStart(5, "0");
    apiSymbol = `hk${paddedSymbol}`;
  }

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
    app: "finance.stock_realtime",
    stoSym: apiSymbol,
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
      let name = null;

      if (data.result && data.result.lists) {
        const keys = Object.keys(data.result.lists);
        if (keys.length > 0) {
          const item = data.result.lists[keys[0]];
          price = item.last_price;
          name = item.sname;
        }
      }

      return {
        success: true as const,
        price: price as string | null,
        name: name as string | null,
        result: data.result,
      };
    }

    return {
      success: false as const,
      message: `${data.msgid} ${data.msg}`,
    };
  } catch (error: any) {
    console.error("Error fetching stock price:", error);
    return {
      success: false as const,
      message: error.message as string,
    };
  }
}
