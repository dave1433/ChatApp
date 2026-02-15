# SSE Demo Chat App

This project is a real-time chat application built using **Server-Sent Events (SSE)** with a **Redis backplane** for realtime broadcasting and **PostgreSQL (Neon)** for persistent storage.

The backend is built with **.NET** and uses **Entity Framework Core** for database access.  
The frontend is built with **React + TypeScript + Vite**.

---

## Features

- Public chat rooms (anyone can connect and read messages)
- Authentication required to send messages
- JWT authentication system (Login endpoint)
- Redis backplane for SSE connections and group messaging
- Messages stored persistently in PostgreSQL (Neon)
- Swagger API documentation

---

## Tech Stack

### Backend
- .NET Web API
- Server-Sent Events (StateleSSE)
- Redis Backplane
- Entity Framework Core
- PostgreSQL (Neon)
- JWT Authentication

### Frontend
- React + TypeScript + Vite

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
DEVELOPMENT_REDIS_CONNECTION=localhost:6379
PRODUCTION_REDIS_CONNECTION=your-production-redis-url

DEVELOPMENT_DB_CONNECTION=Host=...;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true
PRODUCTION_DB_CONNECTION=Host=...;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true

JWT_SECRET=your_super_secret_key_here
