import yahooFinance from "yahoo-finance2";
import { prisma } from "@/lib/prisma";
import { fetchGoldPrice } from "@/lib/domain/market/gold";
import { fetchStockPrice } from "@/lib/domain/market/stock";

const fetchQuoteWithTimeout = async (symbol: string, timeout = 5000) => {
  return Promise.race([
    yahooFinance.quote(symbol),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout for ${symbol}`)), timeout),
    ),
  ]);
};

export async function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
  });
}

export async function listAssetsWithOwner() {
  return prisma.asset.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function listAssetTypes() {
  return prisma.assetType.findMany();
}

type AssetActor = { id: string; role: string };

export type AssetWriteInput = {
  name: string;
  type: string;
  symbol: string;
  quantity: number;
  costPrice: number;
  inputMarketPrice: number | null;
  userId: string;
};

async function resolveMarketPrice(
  symbol: string,
  inputMarketPrice: number | null,
  logLabel?: string,
) {
  if (inputMarketPrice !== null && !isNaN(inputMarketPrice)) {
    return inputMarketPrice;
  }

  if (!symbol) return undefined;

  try {
    if (logLabel) console.log(logLabel, symbol);
    const quote: any = await fetchQuoteWithTimeout(symbol);
    if (quote && quote.regularMarketPrice) {
      if (logLabel) console.log("Fetched price:", quote.regularMarketPrice);
      return quote.regularMarketPrice as number;
    }
  } catch (e) {
    console.warn(`Failed to fetch price for ${symbol}`, e);
  }

  return undefined;
}

export async function createAssetRecord(user: AssetActor, input: AssetWriteInput) {
  try {
    let marketPrice = input.costPrice;

    if (input.inputMarketPrice !== null && !isNaN(input.inputMarketPrice)) {
      marketPrice = input.inputMarketPrice;
    } else if (input.symbol) {
      try {
        const quote: any = await fetchQuoteWithTimeout(input.symbol);
        if (quote && quote.regularMarketPrice) {
          marketPrice = quote.regularMarketPrice;
        }
      } catch (e) {
        console.warn(`Failed to fetch initial price for ${input.symbol}`, e);
      }
    }

    const createData: any = {
      name: input.name,
      type: input.type,
      symbol: input.symbol,
      quantity: input.quantity,
      costPrice: input.costPrice,
      marketPrice,
      userId: user.id,
    };

    if (user.role === "ADMIN" && input.userId) {
      createData.userId = input.userId;
    }

    await prisma.asset.create({
      data: createData,
    });
  } catch (error) {
    console.error("Failed to create asset:", error);
    throw new Error("Failed to create asset");
  }
}

export async function updateAssetRecord(id: string, user: AssetActor, input: AssetWriteInput) {
  console.log("Updating asset:", id);

  try {
    const data: any = {
      name: input.name,
      type: input.type,
      symbol: input.symbol,
      quantity: input.quantity,
      costPrice: input.costPrice,
    };

    const marketPrice = await resolveMarketPrice(
      input.symbol,
      input.inputMarketPrice,
      "Fetching price for symbol:",
    );
    if (marketPrice !== undefined) {
      data.marketPrice = marketPrice;
    }

    if (user.role === "ADMIN" && input.userId) {
      data.userId = input.userId;
    }

    const whereClause: any = { id };
    if (user.role !== "ADMIN") {
      whereClause.userId = user.id;
    }

    await prisma.asset.update({
      where: whereClause,
      data,
    });
    console.log("Asset updated successfully");
  } catch (error) {
    console.error("Failed to update asset:", error);
    throw new Error("Failed to update asset");
  }
}

export async function deleteAssetRecord(id: string, user: AssetActor) {
  try {
    await prisma.asset.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Failed to delete asset:", error);
    throw new Error("Failed to delete asset");
  }
}

export async function getAssetsForUpdate() {
  return prisma.asset.findMany({
    select: {
      id: true,
      symbol: true,
      type: true,
    },
  });
}

export async function updateBatchGoldPrices(ids: string[]) {
  if (!ids.length) return 0;

  try {
    const res = await fetchGoldPrice();
    if (res.success && res.price) {
      const price = parseFloat(res.price);

      const result = await prisma.asset.updateMany({
        where: {
          id: { in: ids },
          type: "PHYSICAL_GOLD",
        },
        data: {
          marketPrice: price,
        },
      });

      return result.count;
    }
    return 0;
  } catch (error) {
    console.error("Failed to batch update gold prices:", error);
    return 0;
  }
}

export async function updateSingleAssetPrice(id: string) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) return false;

    let updated = false;

    if (asset.symbol) {
      if (asset.type === "HK_STOCK") {
        try {
          const res = await fetchStockPrice(asset.symbol);
          if (res.success && res.price) {
            await prisma.asset.update({
              where: { id: asset.id },
              data: { marketPrice: parseFloat(res.price) },
            });
            return true;
          }
        } catch (e) {
          console.error(`Failed to update HK stock price for ${asset.symbol}`, e);
        }
      }

      try {
        const quote: any = await fetchQuoteWithTimeout(asset.symbol);
        if (quote && quote.regularMarketPrice) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { marketPrice: quote.regularMarketPrice },
          });
          updated = true;
        }
      } catch (e) {
        console.error(`Failed to update price for ${asset.symbol}`, e);
      }
    }

    if (asset.type === "PHYSICAL_GOLD") {
      try {
        const res = await fetchGoldPrice();
        if (res.success && res.price) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { marketPrice: parseFloat(res.price) },
          });
          updated = true;
        }
      } catch (e) {
        console.error(`Failed to update gold price for asset ${asset.id}`, e);
      }
    }

    return updated;
  } catch (error) {
    console.error(`Failed to update asset ${id}:`, error);
    return false;
  }
}
