FROM node:18-alpine

RUN mkdir /opt/echo-http
WORKDIR /opt/echo-http

COPY src ./src
COPY assets ./assets
COPY package-lock.json package.json tsconfig.json ./

RUN npm install --omit=dev && npm run build

ENV ECHO_PORT=8080

ENTRYPOINT ["npm", "run", "start"]
