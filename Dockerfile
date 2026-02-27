FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json .

# Generate trước để tsc có thể tìm thấy types
RUN npx prisma generate

RUN npm run build

# Copy generated vào dist để runtime có thể dùng
RUN cp -r /app/generated /app/dist/generated

EXPOSE 3000

CMD ["node", "dist/src/server.js"]