FROM node:12-alpine

WORKDIR /opt/app

RUN apk update && apk upgrade && \
    # Build dependencies for node_modules
    apk add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python3 git curl \
    # Init process
    tini

COPY . ./
RUN npm install

EXPOSE 5000

ENTRYPOINT ["tini", "--"]
CMD npm run start-app
