FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN npx prisma generate

CMD ["yarn", "dev"]
