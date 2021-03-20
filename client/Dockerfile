FROM node:10.16.3-alpine

LABEL version="1.0"
LABEL description="This is the base image for the EHMRS front-end"
LABEL maintainer="ajaomahmud@gmail.com"

RUN mkdir -p /web
WORKDIR /web

COPY ["package*.json", "package-lock.json", "./"]
RUN ls

RUN npm install
COPY . /web

RUN ls