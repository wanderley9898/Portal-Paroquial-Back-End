FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build:prod

ENV NODE_ENV=production
ENV PORT=3902

EXPOSE 3902

CMD ["yarn", "start:prod"]