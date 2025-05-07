"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, PieChart } from "@/components/ui/chart"
import { Search, Calendar, Users, DollarSign } from "lucide-react"
import { bookingsAPI, roomsAPI, eventsAPI } from "@/lib/api"
import { format } from "date-fns"
import { toast } from 'sonner'

// Dummy data for room reservations
const roomReservations = [
  {
    id: 1,
    guestName: "John Smith",
    email: "john.smith@example.com",
    phone: "+233 123 456 789",
    roomType: "expensive",
    checkIn: "2023-05-15",
    checkOut: "2023-05-20",
    guests: 2,
    status: "confirmed",
  },
  {
    id: 2,
    guestName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+233 234 567 890",
    roomType: "standard",
    checkIn: "2023-05-18",
    checkOut: "2023-05-22",
    guests: 1,
    status: "confirmed",
  },
  {
    id: 3,
    guestName: "Michael Brown",
    email: "michael.b@example.com",
    phone: "+233 345 678 901",
    roomType: "regular",
    checkIn: "2023-05-20",
    checkOut: "2023-05-25",
    guests: 2,
    status: "pending",
  },
  {
    id: 4,
    guestName: "Emily Davis",
    email: "emily.d@example.com",
    phone: "+233 456 789 012",
    roomType: "expensive",
    checkIn: "2023-05-22",
    checkOut: "2023-05-28",
    guests: 3,
    status: "confirmed",
  },
  {
    id: 5,
    guestName: "David Wilson",
    email: "david.w@example.com",
    phone: "+233 567 890 123",
    roomType: "standard",
    checkIn: "2023-05-25",
    checkOut: "2023-05-30",
    guests: 2,
    status: "confirmed",
  },
  {
    id: 6,
    guestName: "Jennifer Lee",
    email: "jennifer.l@example.com",
    phone: "+233 678 901 234",
    roomType: "regular",
    checkIn: "2023-05-28",
    checkOut: "2023-06-02",
    guests: 1,
    status: "pending",
  },
]

// Dummy data for event reservations
const eventReservations = [
  {
    id: 1,
    guestName: "Corporate Solutions Ltd",
    email: "events@corpsolutions.com",
    phone: "+233 123 456 789",
    eventType: "conference",
    date: "2023-06-15",
    guests: 75,
    status: "confirmed",
  },
  {
    id: 2,
    guestName: "Johnson Family",
    email: "johnson.family@example.com",
    phone: "+233 234 567 890",
    eventType: "compound",
    date: "2023-06-18",
    guests: 120,
    status: "confirmed",
  },
  {
    id: 3,
    guestName: "Tech Innovators Inc",
    email: "events@techinnovators.com",
    phone: "+233 345 678 901",
    eventType: "conference",
    date: "2023-06-25",
    guests: 50,
    status: "pending",
  },
  {
    id: 4,
    guestName: "Smith Wedding",
    email: "smith.wedding@example.com",
    phone: "+233 456 789 012",
    eventType: "compound",
    date: "2023-07-02",
    guests: 150,
    status: "confirmed",
  },
  {
    id: 5,
    guestName: "Global Finance Summit",
    email: "summit@globalfinance.com",
    phone: "+233 567 890 123",
    eventType: "conference",
    date: "2023-07-10",
    guests: 100,
    status: "confirmed",
  },
  {
    id: 6,
    guestName: "Williams Anniversary",
    email: "williams@example.com",
    phone: "+233 678 901 234",
    eventType: "compound",
    date: "2023-07-15",
    guests: 80,
    status: "pending",
  },
]

// Chart data
const roomChartData = [
  {
    name: "Room Reservations by Type",
    data: [
      { name: "Expensive", value: 2 },
      { name: "Standard", value: 2 },
      { name: "Regular", value: 2 },
    ],
  },
]

const eventChartData = [
  {
    name: "Event Reservations by Type",
    data: [
      { name: "Compound", value: 3 },
      { name: "Conference", value: 3 },
    ],
  },
]

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRooms: number;
  totalEvents: number;
  recentBookings: any[];
  totalRevenue: number;
  averageBookingValue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    totalRooms: 0,
    totalEvents: 0,
    recentBookings: [],
    totalRevenue: 0,
    averageBookingValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookings, rooms, events] = await Promise.all([
        bookingsAPI.getAll(),
        roomsAPI.getAll(),
        eventsAPI.getAll(),
      ]);

      const pendingBookings = bookings.filter((b: any) => b.status === 'pending');
      const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed');
      const totalRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
      const averageBookingValue = confirmedBookings.length > 0 
        ? totalRevenue / confirmedBookings.length 
        : 0;

      setStats({
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        totalRooms: rooms.length,
        totalEvents: events.length,
        recentBookings: bookings.slice(0, 5),
        totalRevenue,
        averageBookingValue,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery) {
        filters.guestName = searchQuery;
      }
      if (dateRange.startDate) {
        filters.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        filters.endDate = dateRange.endDate;
      }

      const bookings = await bookingsAPI.getAll(filters);
      setStats(prev => ({ ...prev, recentBookings: bookings }));
    } catch (error) {
      toast.error('Failed to search bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  // Filter room reservations
  const filteredRoomReservations = roomReservations.filter((reservation) => {
    const matchesFilter = roomFilter === "all" || reservation.roomType === roomFilter
    const matchesSearch =
      reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Filter event reservations
  const filteredEventReservations = eventReservations.filter((reservation) => {
    const matchesFilter = eventFilter === "all" || reservation.eventType === eventFilter
    const matchesSearch =
      reservation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Format room type for display
  const formatRoomType = (type: string) => {
    switch (type) {
      case "expensive":
        return "Expensive Suite"
      case "standard":
        return "Standard Room"
      case "regular":
        return "Regular Room"
      default:
        return type
    }
  }

  // Format event type for display
  const formatEventType = (type: string) => {
    switch (type) {
      case "compound":
        return "Compound Event"
      case "conference":
        return "Conference Event"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage room and event reservations for Luxury Hotel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} pending bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg. ${stats.averageBookingValue.toLocaleString()} per booking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Available for booking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Available for booking
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="max-w-[200px]"
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="max-w-[200px]"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        {booking.guestName}
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {booking.bookingType === 'room' ? 'Room' : 'Event'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>${booking.totalPrice}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === 'confirmed'
                              ? 'default'
                              : booking.status === 'pending'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
