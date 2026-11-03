export async function testAiConnection(provider: string, apiKey: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    let apiUrl = "";
    if (provider === "deepseek") {
      apiUrl = "https://api.deepseek.com/models";
    } else if (provider === "openrouter") {
      apiUrl = "https://openrouter.ai/api/v1/models";
    } else {
      return { success: false, message: "不支持的服务商" };
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      return { success: true, message: "连接成功" };
    }
    return { success: false, message: `连接失败: ${response.statusText}` };
  } catch (error: any) {
    return { success: false, message: `连接错误: ${error.message}` };
  }
}

export async function getAiModels(provider: string, apiKey: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    let apiUrl = "";
    if (provider === "deepseek") {
      apiUrl = "https://api.deepseek.com/models";
    } else if (provider === "openrouter") {
      apiUrl = "https://openrouter.ai/api/v1/models";
    } else {
      return { error: "不支持的服务商" };
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      return { error: `获取模型列表失败: ${response.statusText}` };
    }

    const data = await response.json();

    let models: { id: string; name: string }[] = [];

    if (data.data && Array.isArray(data.data)) {
      models = data.data.map((m: any) => ({
        id: m.id,
        name: m.id,
      }));
    } else {
      console.warn("Unexpected API response structure:", data);
    }

    return { models };
  } catch (error: any) {
    return { error: `获取模型列表错误: ${error.message}` };
  }
}
