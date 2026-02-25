# this dockerfile is for the bullmq worker

FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

CMD ["node", "dist/workers/pr.worker.js"]