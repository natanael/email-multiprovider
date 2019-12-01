FROM node:10-alpine
LABEL maintainer="Keymetrics <contact@keymetrics.io>"

# Install pm2
RUN npm install pm2 -g

WORKDIR /app

COPY dist ./dist

COPY package.json .

COPY yarn.lock .

RUN yarn install

COPY pm2.json .

# Expose ports needed to use Keymetrics.io
EXPOSE 80

# Start pm2.json process file
CMD ["pm2-runtime", "start", "pm2.json"]
