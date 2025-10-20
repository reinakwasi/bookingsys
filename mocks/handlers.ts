import { http, HttpResponse } from 'msw';

// Make mockEvents mutable for admin operations
let eventIdCounter = 5;

const mockRooms = [
  {
    _id: '1',
    name: 'Royal Suite',
    description: 'Spacious suite with premium amenities and city view',
    price: 350,
    capacity: 2,
    amenities: ['Large Bed', 'Air Conditioning', 'Smart TV', 'Luxury Bathroom', 'Fridge', 'Table & Chair', 'Breakfast Included'],
    images: ['/one.jpg', '/two.jpg'],
    type: 'expensive',
    available: true
  },
  {
    _id: '2', 
    name: 'Superior Room',
    description: 'Comfortable room with modern facilities',
    price: 300,
    capacity: 2,
    amenities: ['Standard Bed', 'Air Conditioning', 'Smart TV', 'Modern Bathroom', 'Fridge', 'Table & Chair', 'Breakfast Included'],
    images: ['/three.jpg'],
    type: 'standard',
    available: true
  },
  {
    _id: '3',
    name: 'Classic Room', 
    description: 'Basic room with essential amenities',
    price: 250,
    capacity: 1,
    amenities: ['Classic Bed', 'Air Conditioning', 'TV', 'Private Bathroom', 'Fridge', 'Table & Chair', 'Breakfast Included'],
    images: ['/room1.jpg'],
    type: 'regular',
    available: false
  }
];

const mockEvents: any[] = [];

const mockBookings = [
  {
    id: '1',
    roomId: '1',
    roomName: 'Royal Suite',
    checkIn: '2025-09-10',
    checkOut: '2025-09-12',
    guests: 2,
    totalPrice: 1000,
    status: 'confirmed',
    createdAt: '2025-09-01'
  },
  {
    id: '2',
    roomId: '2',
    roomName: 'Superior Room',
    checkIn: '2025-09-15',
    checkOut: '2025-09-17',
    guests: 2,
    totalPrice: 400,
    status: 'pending',
    createdAt: '2025-09-02'
  }
];


export const handlers = [
  // Rooms API
  http.get('http://localhost:5000/api/rooms', () => {
    return HttpResponse.json(mockRooms);
  }),
  http.get('http://localhost:5000/api/rooms/:id', ({ params }) => {
    const room = mockRooms.find(r => r._id === params.id);
    if (!room) {
      return new HttpResponse(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    return HttpResponse.json(room);
  }),

  // Events API
  http.get('http://localhost:5000/api/events', () => {
    return HttpResponse.json(mockEvents);
  }),

  http.get('http://localhost:5000/api/events/:id', ({ params }) => {
    const { id } = params;
    const event = mockEvents.find(e => e._id === id);
    if (event) {
      return HttpResponse.json(event);
    }
    return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
  }),

  http.post('http://localhost:5000/api/events', async ({ request }) => {
    const body = await request.json() as any;
    const newEvent = {
      _id: String(mockEvents.length + 1),
      name: body.name,
      description: body.description,
      category: body.category,
      date: body.date,
      price: body.price,
      capacity: body.capacity,
      image: body.image_url || body.image || '/cont.jpg',
      available: true
    };
    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('http://localhost:5000/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const eventIndex = mockEvents.findIndex(e => e._id === id);
    
    if (eventIndex !== -1) {
      mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...body };
      return HttpResponse.json(mockEvents[eventIndex]);
    }
    return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
  }),

  http.delete('http://localhost:5000/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = mockEvents.findIndex(e => e._id === id);
    
    if (eventIndex !== -1) {
      const deletedEvent = mockEvents.splice(eventIndex, 1)[0];
      return HttpResponse.json({ message: 'Event deleted successfully', event: deletedEvent });
    }
    return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
  }),

  // Bookings API
  http.get('http://localhost:5000/api/bookings', () => {
    return HttpResponse.json(mockBookings);
  }),

  http.get('http://localhost:5000/api/bookings/my-bookings', () => {
    return HttpResponse.json(mockBookings);
  }),

  http.post('http://localhost:5000/api/bookings', async ({ request }) => {
    const body = await request.json() as any;
    const newBooking = {
      id: String(mockBookings.length + 1),
      ...body,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockBookings.push(newBooking);
    return HttpResponse.json(newBooking, { status: 201 });
  }),


  // Auth API (basic mock)
  http.post('http://localhost:5000/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { id: '1', username: 'testuser', email: 'test@example.com' }
    });
  }),

  http.get('http://localhost:5000/api/auth/me', () => {
    return HttpResponse.json({ id: '1', username: 'testuser', email: 'test@example.com' });
  })
];
