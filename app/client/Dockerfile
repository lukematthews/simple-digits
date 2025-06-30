# Build Stage
FROM node:22 AS builder

WORKDIR /app
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
