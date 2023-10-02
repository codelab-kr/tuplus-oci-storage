FROM node:17.9.1-alpine3.14 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:17.9.1-alpine3.14
WORKDIR /usr/src/app
RUN mkdir /root/.oci
COPY ./.oci /root/.oci
COPY package*.json /usr/src/app/
RUN npm ci --omit dev
COPY --from=builder /usr/src/app/dist/ ./dist/
CMD npx wait-port rabbit:5672 && \
    npm start