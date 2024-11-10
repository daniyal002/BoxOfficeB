# Указываем базовый образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы приложения
COPY . .

# Собираем Prisma
RUN npx prisma generate

# Собираем приложение (если у вас есть скрипт build в package.json)
RUN npm run build

# Открываем порт, на котором будет работать приложение
EXPOSE 3002

# Запускаем приложение
CMD ["npm", "start"]