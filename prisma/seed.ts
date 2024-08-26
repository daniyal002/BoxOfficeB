import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Найти или создать роль Admin
  const adminRole = await prisma.role.upsert({
    where: { role_name: 'Admin' },
    update: {},
    create: { role_name: 'Admin' },
  });

  // Создать пользователя Admin
  await prisma.user.upsert({
    where: { user_name: 'admin' },
    update: {},
    create: {
      user_name: 'admin',
      password: 'daniyalou2002', // Замените на зашифрованный пароль
      role: {
        connect: { id: adminRole.id }, // Связь с ролью Admin
      },
      employee: {
        create: {
          employee_name: 'Admin User',
          post: {
            create: { post_name: 'Админ' },
          },
          department: {
            create: { department_name: 'Основа' },
          },
          dismissed: false,
        },
      },
    },
  });
}

main()
  .then(() => {
    console.log('Seeding finished.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
