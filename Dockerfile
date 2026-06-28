# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 2: Production Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_MIDTRANS_CLIENT_KEY
ARG VITE_RAJAONGKIR_API_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY
ENV VITE_RAJAONGKIR_API_KEY=$VITE_RAJAONGKIR_API_KEY
RUN npm run build

# Stage 3: Production Server
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
