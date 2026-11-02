export async function testNowApiConnection(appkey: string, sign: string) {
  try {
    const url = "http://api.k780.com";
    const params = new URLSearchParams({
      app: "finance.gold_price",
      goldid: "1053",
      appkey: appkey,
      sign: sign,
      format: "json",
    });

    const fullUrl = `${url}?${params.toString()}`;
    const response = await fetch(fullUrl, { cache: "no-store" });
    const data = await response.json();

    if (data.success === "1") {
      return { success: true, message: "连接成功" };
    }
    return { success: false, message: `连接失败: ${data.msg || "未知错误"}` };
  } catch (error: any) {
    return { success: false, message: `连接错误: ${error.message}` };
  }
}
