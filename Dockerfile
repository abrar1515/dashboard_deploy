FROM node:20-alpine

WORKDIR /app

# 1. Package files copy karke install karein
COPY package*.json ./
RUN npm install

# 2. Pura code copy karein
COPY . .

# 3. Production build generate karein
RUN npm run build

# 4. Environment Port
ENV PORT=4000
EXPOSE 4000

# 5. SAFE PRODUCTION EXECUTION:
# Hum node ko bolte hain ke app ko absolute path ke bajaye direct dist ke andar ja kar execute kare.
# Is se thread-stream ya kisi bhi worker module ko relative path automatically mil jata hai.
CMD ["sh", "-c", "cd dist && node main.js"]