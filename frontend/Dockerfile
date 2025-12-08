# Imagen base
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Definir variable global en build
ENV VITE_API_URL=http://localhost:8000


EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]