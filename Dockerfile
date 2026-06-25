FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Yahan hum sirf production wale packages install kar rahe hain
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Yahan build folder se compiled code copy ho raha hai
COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]