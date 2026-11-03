// Manual data dump. Not part of the app runtime.
// Usage: node scripts/debug-data.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found');
    return;
  }
  const userId = users[0].id;
  console.log('Checking data for user:', users[0].name);

  const accounts = await prisma.account.findMany({ where: { userId } });
  console.log('\nAccounts:');
  accounts.forEach(acc => {
    console.log(`- ${acc.name} (${acc.type}): ${acc.balance}`);
  });

  const assets = await prisma.asset.findMany({ where: { userId } });
  console.log('\nAssets:');
  assets.forEach(asset => {
    console.log(`- ${asset.name} (${asset.type}): Qty ${asset.quantity}, Price ${asset.marketPrice || asset.costPrice}`);
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  console.log(`\nChecking transactions from ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  console.log('\nTransactions (This Month):');
  transactions.forEach(t => {
    console.log(`- ${t.date.toISOString()} [${t.type}] ${t.amount} (${t.description || 'No desc'})`);
  });

  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  console.log(`\nCalculated Income: ${income}`);
  console.log(`Calculated Expense: ${expense}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
