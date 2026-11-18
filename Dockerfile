FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build:prod

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["yarn", "start:prod"]