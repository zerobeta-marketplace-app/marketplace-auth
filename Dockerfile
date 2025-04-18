FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Install production dependencies after build to avoid copying Mac-native binaries
RUN npm ci --omit=dev

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules

# Install netcat for waiting on ports
#RUN apk add --no-cache netcat-openbsd
RUN apk add --no-cache netcat-openbsd dos2unix

# Add wait-for-kafka script
#COPY wait-for-kafka.sh /usr/src/app/wait-for-kafka.sh
#UN chmod +x /usr/src/app/wait-for-kafka.sh
COPY wait-for-kafka.sh /usr/src/app/wait-for-kafka.sh
RUN dos2unix /usr/src/app/wait-for-kafka.sh && chmod +x /usr/src/app/wait-for-kafka.sh


EXPOSE 3000
CMD ["node", "dist/main"]
