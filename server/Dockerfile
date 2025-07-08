FROM node:22-alpine

WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .

RUN npx prisma generate
RUN npm run build

ENV PORT=4000
EXPOSE 4000

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]