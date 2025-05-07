# Hotel Booking System

A full-stack hotel booking system built with Next.js, Express.js, and MongoDB.

## Features

- Room booking with date selection and validation
- Event booking for various occasions
- Admin dashboard for managing bookings
- User authentication and authorization
- Responsive design for mobile and desktop
- Form validation and error handling
- Search and filter functionality
- Real-time booking status updates

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form with Zod validation
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing

## Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- pnpm (recommended) or npm

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-booking-system
```

2. Install frontend dependencies:
```bash
pnpm install
```

3. Install backend dependencies:
```bash
cd server
pnpm install
```

4. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

6. Start the development servers:

In the root directory (frontend):
```bash
pnpm dev
```

In the server directory (backend):
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
hotel-booking-system/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── rooms/             # Room booking pages
│   ├── events/            # Event booking pages
│   └── ...
├── components/            # Reusable React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API client
├── public/              # Static assets
├── server/              # Backend Express.js server
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── index.js     # Server entry point
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - Register new admin
- GET /api/auth/me - Get current user

### Rooms
- GET /api/rooms - Get all rooms
- GET /api/rooms/:id - Get single room
- POST /api/rooms - Create room (admin)
- PUT /api/rooms/:id - Update room (admin)
- DELETE /api/rooms/:id - Delete room (admin)

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get single event
- POST /api/events - Create event (admin)
- PUT /api/events/:id - Update event (admin)
- DELETE /api/events/:id - Delete event (admin)

### Bookings
- GET /api/bookings - Get all bookings (admin)
- GET /api/bookings/my-bookings - Get user's bookings
- POST /api/bookings - Create booking
- PATCH /api/bookings/:id/status - Update booking status (admin)
- PATCH /api/bookings/:id/cancel - Cancel booking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 