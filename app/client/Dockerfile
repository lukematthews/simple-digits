# Build Stage
FROM node:22 AS builder

WORKDIR /app

ARG VITE_API_HTTP_URL
ENV VITE_API_HTTP_URL=$VITE_API_HTTP_URL

COPY ./package*.json ./
RUN npm install

COPY ./ .
RUN npm run build

# Serve Stage
FROM node:22

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
