FROM node:22-slim

RUN npx playwright install chromium --with-deps

WORKDIR /app

COPY package*.json ./ 

RUN npm ci --only=production

COPY . .

CMD ["node", "server.js"]
