// Superseded by prisma/seed.ts (`npx prisma db seed`). Kept for reference only.
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10)

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'mobowp027@gmail.com' },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: 'mobowp027@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  })

  console.log({ admin })

  // Create Expense Categories (if not exist)
  const expenseCategories = [
    { name: '餐饮', type: 'EXPENSE', icon: 'utensils' },
    { name: '交通', type: 'EXPENSE', icon: 'bus' },
    { name: '购物', type: 'EXPENSE', icon: 'shopping-bag' },
    { name: '娱乐', type: 'EXPENSE', icon: 'gamepad-2' },
    { name: '住房', type: 'EXPENSE', icon: 'home' },
    { name: '医疗', type: 'EXPENSE', icon: 'stethoscope' },
  ]

  for (const cat of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    })
    
    if (!existing) {
      await prisma.category.create({
        data: cat
      })
    }
  }

  // Create Income Categories
  const incomeCategories = [
    { name: '工资', type: 'INCOME', icon: 'banknote' },
    { name: '奖金', type: 'INCOME', icon: 'gift' },
    { name: '理财收益', type: 'INCOME', icon: 'trending-up' },
  ]

  for (const cat of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type }
    })
    
    if (!existing) {
      await prisma.category.create({
        data: cat
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
