FROM node:18 AS base
ARG WS_PATH
ENV WS_PATH=$WS_PATH
RUN apt-get update
RUN apt-get install dumb-init
USER node
WORKDIR /usr/node/app
COPY --chown=node:node .yarnrc.yml .yarn package.json yarn.lock ./
RUN yarn install --production


FROM base AS build
RUN yarn install
COPY --chown=node:node . .
RUN yarn build


FROM base As run
COPY --chown=node:node --from=build /usr/node/app/dist/$WS_NAME ./dist

CMD [ "dumb-init", "node", "dist/main.js" ]
