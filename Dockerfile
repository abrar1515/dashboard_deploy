FROM node:20-alpine

WORKDIR /app

# 1. Dependency installation
COPY package*.json ./
RUN npm install

# 2. Source code copy aur production build
COPY . .
RUN npm run build

# 3. Environment Port
ENV PORT=4000
EXPOSE 4000

# 4. GUARANTEED RUN SCRIPT:
# Yeh script pure dist folder ko scan karegi ke main.js kahan hai.
# Phir usi exact directory ke andar ja kar application ko execute karegi taake absolute paths ka rona khatam ho sake.
CMD ["sh", "-c", "MAIN_PATH=$(find dist -name main.js | head -n 1); if [ -n \"$MAIN_PATH\" ]; then DIR_PATH=$(dirname \"$MAIN_PATH\"); echo \"Found main.js in: $DIR_PATH\"; cd \"$DIR_PATH\" && node main.js; else echo \"Error: main.js not found anywhere in dist!\"; exit 1; fi"]