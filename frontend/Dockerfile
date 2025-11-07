FROM node:20
WORKDIR /app
COPY package*.json ./
# Ensure patch-package binary is available for any postinstall scripts
RUN npm install -g patch-package@6.5.0
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8000"]