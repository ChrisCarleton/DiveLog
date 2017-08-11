FROM node:8.3.0

RUN mkdir -p /usr/src/divelog
WORKDIR /usr/src/divelog
COPY package.json package.json
RUN npm install -g --loglevel error gulp bunyan
RUN npm install --loglevel error

COPY . .
RUN gulp bundle

CMD ["npm", "run", "server"]
EXPOSE 8100
