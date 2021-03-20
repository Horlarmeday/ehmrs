FROM node:10.16.3-alpine

LABEL version="1.0"
LABEL description="This is the base image for the EHMRS backend API"
LABEL maintainer="ajaomahmud@gmail.com"

RUN mkdir -p /app
WORKDIR /app

COPY ["package*.json", "package-lock.json", "./"],
RUN ls
RUN npm install

COPY . /app
RUN ls