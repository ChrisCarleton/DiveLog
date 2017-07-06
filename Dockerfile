FROM node:6.11

RUN mkdir -p /usr/src/divelog
WORKDIR /usr/src/divelog
COPY package.json package.json
RUN npm install -g --loglevel error gulp bunyan
RUN npm install --loglevel error

COPY . .
RUN gulp bundle
RUN deploy/install-phantomjs.sh

CMD ["npm", "run", "server"]
EXPOSE 8100
