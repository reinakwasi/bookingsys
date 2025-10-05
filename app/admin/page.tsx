"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { eventsAPI, bookingsAPI, ticketsAPI, ticketPurchasesAPI } from "@/lib/api";
import { messagesAPI } from "@/lib/messagesAPI";
import { Plus, Edit, Trash2, Calendar, Users, DollarSign, CheckCircle, Clock, XCircle, QrCode, Ticket, Scan, Camera, CameraOff, Menu, X } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TOTAL_ROOMS = {
  royal_suite: 5,
  superior_room: 5,
  classic_room: 5
};

export default function AdminDashboard() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [trashedBookings, setTrashedBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketPurchases, setTicketPurchases] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: '',
    checkIn: '',
    checkOut: '',
    specialRequests: ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    activity_type: '',
    event_date: '',
    event_time: '',
    price: '',
    total_quantity: '',
    image_url: '',
    venue: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [qrCode, setQrCode] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [showDeleteTicketDialog, setShowDeleteTicketDialog] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    console.log('📊 Admin page useEffect - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user ? user.username : 'NULL');
    
    // If still loading, don't do anything
    if (loading) {
      console.log('⏳ Still loading auth state...');
      return;
    }
    
    // Set auth check as complete immediately when loading is done
    setAuthCheckComplete(true);
    
    // If authenticated, we're good
    if (isAuthenticated && user) {
      console.log('✅ Authenticated as:', user.username, '- admin page ready');
    } else {
      console.log('⚠️ Not authenticated - showing login form');
    }
  }, [isAuthenticated, loading, user]);

  useEffect(() => {
    if (activeMenu === 'events') {
      loadEvents();
    } else if (activeMenu === 'tickets') {
      loadTickets();
    } else if (activeMenu === 'trash') {
      loadDeletedBookings();
    } else if (activeMenu === 'messages') {
      loadMessages();
    }
  }, [activeMenu]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await eventsAPI.getAll();
      setEvents(eventsData);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const [ticketsData, purchasesData] = await Promise.all([
        ticketsAPI.getAll(),
        ticketPurchasesAPI.getAll()
      ]);
      setTickets(ticketsData);
      setTicketPurchases(purchasesData);
    } catch (error) {
      toast.error('Failed to load tickets');
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const loadDeletedBookings = async () => {
    try {
      const deletedData = await bookingsAPI.getDeleted();
      setTrashedBookings(deletedData);
    } catch (error) {
      toast.error('Failed to load deleted bookings');
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await messagesAPI.getAll();
      setMessages(msgs);
      const unread = msgs.filter((m: any) => !m.is_read).length;
      setUnreadMessages(unread);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const msgType = selectedMessage?.type || 'review';
    await messagesAPI.markAsRead(id, msgType);
    loadMessages();
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, is_read: true });
    }
  };


  const handleDeleteMessage = async (id: string) => {
    await messagesAPI.delete(id);
    setSelectedMessage(null);
    loadMessages();
    toast.success('Message deleted');
  };

  const handleCreateBooking = async () => {
    if (!bookingForm.guestName || !bookingForm.roomType || !bookingForm.checkIn || !bookingForm.checkOut || !bookingForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingBooking(true);
    try {
      // Calculate room price based on room type
      const roomPrices = {
        'royal_suite': 500,
        'superior_room': 300,
        'classic_room': 200
      };
      
      const checkInDate = new Date(bookingForm.checkIn);
      const checkOutDate = new Date(bookingForm.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
      const totalAmount = roomPrices[bookingForm.roomType as keyof typeof roomPrices] * nights;

      // Use the same API call structure as the user form
      const bookingData = {
        guest_name: bookingForm.guestName,
        email: bookingForm.email || '',
        phone: bookingForm.phone,
        start_date: bookingForm.checkIn,
        end_date: bookingForm.checkOut,
        booking_type: 'room',
        item_id: bookingForm.roomType,
        total_price: totalAmount,
        special_requests: bookingForm.specialRequests || '',
      };

      await bookingsAPI.create(bookingData);
      
      // Reset form
      setBookingForm({
        guestName: '',
        email: '',
        phone: '',
        roomType: '',
        checkIn: '',
        checkOut: '',
        specialRequests: ''
      });
      
      setIsNewBookingDialogOpen(false);
      loadDashboardData(); // Refresh dashboard data
      toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking: ' + (error as Error).message);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleReplyMessage = () => {
    setReplyContent('');
    setShowReplyDialog(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    try {
      // Send email via email service
      const { emailService } = await import('@/lib/emailService');
      await emailService.sendReply({
        to: selectedMessage.email,
        subject: selectedMessage.subject || 'Your message to Hotel 734',
        message: replyContent,
        replyToMessageId: selectedMessage.id,
        originalMessage: selectedMessage.message
      });

      // Save reply to database
      await messagesAPI.sendReply({
        messageId: selectedMessage.id,
        replyContent,
        sentToEmail: selectedMessage.email
      });

      // Update UI
      setShowReplyDialog(false);
      setReplyContent('');
      setSelectedMessage({ ...selectedMessage, replied_at: new Date().toISOString() });
      loadMessages();
      
      toast.success('Reply sent successfully!');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      // Load bookings (now automatically excludes deleted ones from database)
      const bookingsData = await bookingsAPI.getAll();
      console.log('Loaded bookings:', bookingsData);
      setBookings(bookingsData);
      
      // Calculate stats using bookings data
      const totalBookings = bookingsData.length;
      const totalRevenue = bookingsData.reduce((sum: number, booking: any) => sum + (booking.total_price || booking.totalPrice || 0), 0);
      const pendingBookings = bookingsData.filter((booking: any) => booking.status === 'pending').length;
      
      setStats({
        totalBookings,
        totalRevenue,
        pendingBookings
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Set empty data to prevent UI errors
      setBookings([]);
      setStats({
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    console.log('Delete button clicked for booking ID:', bookingId);
    console.log('Available bookings:', bookings.map(b => ({ id: b.id, status: b.status })));
    setShowDeleteDialog(true);
    setBookingToDelete(bookingId);
  };

  const handleUpdateStatus = (booking: any) => {
    setBookingToUpdate(booking);
    setNewStatus(booking.status);
    setShowStatusDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!bookingToUpdate || !newStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      // Update status first
      await bookingsAPI.updateStatus(bookingToUpdate.id, newStatus);
      
      // Update local state immediately for instant UI feedback
      setBookings(prev => prev.map(b => 
        b.id === bookingToUpdate.id ? { ...b, status: newStatus } : b
      ));
      
      // Update stats if needed
      if (bookingToUpdate.status === 'pending' && newStatus !== 'pending') {
        setStats(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }));
      } else if (bookingToUpdate.status !== 'pending' && newStatus === 'pending') {
        setStats(prev => ({ ...prev, pendingBookings: prev.pendingBookings + 1 }));
      }
      
      // Show success message immediately
      toast.success(`Booking status updated to ${newStatus}`);
      
      // Close dialog immediately
      setShowStatusDialog(false);
      setBookingToUpdate(null);
      setNewStatus('');
      
      // Send checkout email asynchronously (don't block UI)
      if (newStatus === 'completed' && bookingToUpdate.email) {
        fetch('/api/send-checkout-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingToUpdate.id,
            guestName: bookingToUpdate.guest_name,
            email: bookingToUpdate.email,
            bookingType: bookingToUpdate.booking_type,
            itemName: bookingToUpdate.item_id,
            checkoutDate: new Date().toLocaleDateString()
          }),
        }).then(response => {
          if (response.ok) {
            toast.success('Checkout email sent to guest');
          } else {
            console.warn('Failed to send checkout email');
          }
        }).catch(emailError => {
          console.error('Error sending checkout email:', emailError);
        });
      }
      
    } catch (error) {
      toast.error('Failed to update booking status');
      // Don't close dialog on error so user can retry
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      console.log('Deleting booking:', bookingToDelete);
      
      // Delete from database (marks as deleted with status and deleted_at)
      const result = await bookingsAPI.delete(bookingToDelete);
      console.log('Delete result:', result);
      
      // Immediately remove from local state to provide instant feedback
      setBookings(prev => {
        const filtered = prev.filter(b => b.id !== bookingToDelete);
        console.log(`Filtered bookings: ${filtered.length} (was ${prev.length})`);
        return filtered;
      });
      
      // Update stats immediately
      setStats(prevStats => ({
        ...prevStats,
        totalBookings: prevStats.totalBookings - 1,
        pendingBookings: prevStats.pendingBookings - (bookings.find(b => b.id === bookingToDelete)?.status === 'pending' ? 1 : 0)
      }));
      
      // Reload dashboard data immediately to ensure database consistency
      await loadDashboardData();
      
      toast.success('Booking deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete booking: ' + (error as Error).message);
      // Reload data on error to ensure consistency
      await loadDashboardData();
    } finally {
      setShowDeleteDialog(false);
      setBookingToDelete(null);
    }
  };

  const getRoomBookings = (roomType: string) => {
    return bookings.filter(booking => 
      (booking.booking_type === 'room' || booking.bookingType === 'room') && 
      (booking.item_id === roomType || booking.itemId === roomType)
    );
  };

  const getCurrentlyOccupiedRooms = (roomType: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter(booking => {
      if ((booking.booking_type !== 'room' && booking.bookingType !== 'room') || 
          (booking.item_id !== roomType && booking.itemId !== roomType)) {
        return false;
      }
      
      // Skip cancelled or deleted bookings
      if (booking.status === 'cancelled' || booking.status === 'deleted') {
        return false;
      }
      
      const checkIn = new Date(booking.start_date || booking.checkIn);
      const checkOut = new Date(booking.end_date || booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      // Room is currently occupied if today is between check-in and check-out (inclusive of check-in, exclusive of check-out)
      return checkIn <= today && today < checkOut;
    });
  };

  const getEventBookings = (eventType: string) => {
    return bookings.filter(booking => {
      const isEventBooking = booking.booking_type === 'event' || booking.bookingType === 'event';
      if (!isEventBooking) return false;
      
      // Check if item_id matches the event type (conference/compound)
      const itemId = booking.item_id || booking.itemId;
      return itemId && itemId.toLowerCase() === eventType.toLowerCase();
    });
  };

  const calculateRoomAvailability = () => {
    const today = new Date();
    const roomTypes = ['royal_suite', 'superior_room', 'classic_room'];
    
    return roomTypes.map(roomType => {
      // Count active bookings for this room type that overlap with current date
      const activeBookings = bookings.filter(booking => {
        const isRoomBooking = booking.booking_type === 'room' || booking.bookingType === 'room';
        const matchesRoomType = (booking.item_id || booking.itemId) === roomType;
        const isActive = booking.status !== 'cancelled';
        
        if (!isRoomBooking || !matchesRoomType || !isActive) return false;
        
        // Check if booking is currently active (overlaps with today)
        const startDate = new Date(booking.start_date || booking.startDate);
        const endDate = new Date(booking.end_date || booking.endDate);
        return startDate <= today && endDate >= today;
      });
      
      const occupied = activeBookings.length;
      const total = TOTAL_ROOMS[roomType as keyof typeof TOTAL_ROOMS];
      const available = Math.max(0, total - occupied);
      
      return {
        label: roomType === 'royal_suite' ? 'Royal Suite' : roomType === 'superior_room' ? 'Superior Room' : 'Classic Room',
        available,
        total,
        roomType
      };
    });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Create a simple base64 data URL for now
    // In production, you would upload to Supabase storage or another service
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateTicket = async () => {
    setIsCreatingTicket(true);
    try {
      let imageUrl = ticketForm.image_url;
      
      if (imageFile) {
        toast.info('Uploading image...');
        imageUrl = await handleImageUpload(imageFile);
      }

      toast.info('Creating ticket...');
      await ticketsAPI.create({
        ...ticketForm,
        image_url: imageUrl,
        price: parseFloat(ticketForm.price),
        total_quantity: parseInt(ticketForm.total_quantity),
        status: 'active' // Always create as active
      });
      
      setIsTicketDialogOpen(false);
      setTicketForm({
        title: '',
        description: '',
        activity_type: '',
        event_date: '',
        event_time: '',
        price: '',
        total_quantity: '',
        image_url: '',
        venue: ''
      });
      setImageFile(null);
      setImagePreview('');
      loadTickets();
      toast.success('Ticket created successfully!');
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleEditTicket = (ticket: any) => {
    setCurrentTicket(ticket);
    setTicketForm({
      title: ticket.title,
      description: ticket.description,
      activity_type: ticket.activity_type,
      event_date: ticket.event_date,
      event_time: ticket.event_time,
      price: ticket.price.toString(),
      total_quantity: ticket.total_quantity.toString(),
      image_url: ticket.image_url || '',
      venue: ticket.venue || ''
    });
    setImagePreview(ticket.image_url || '');
    setImageFile(null);
    setIsEditingTicket(true);
    setIsTicketDialogOpen(true);
  };

  const handleUpdateTicket = async () => {
    if (!currentTicket) return;
    setIsUpdatingTicket(true);
    try {
      let imageUrl = ticketForm.image_url;
      
      if (imageFile) {
        toast.info('Uploading image...');
        imageUrl = await handleImageUpload(imageFile);
      }

      toast.info('Updating ticket...');
      await ticketsAPI.update(currentTicket.id, {
        ...ticketForm,
        image_url: imageUrl,
        price: parseFloat(ticketForm.price),
        total_quantity: parseInt(ticketForm.total_quantity)
      });
      
      setIsTicketDialogOpen(false);
      setIsEditingTicket(false);
      setCurrentTicket(null);
      setTicketForm({
        title: '',
        description: '',
        activity_type: '',
        event_date: '',
        event_time: '',
        price: '',
        total_quantity: '',
        image_url: '',
        venue: ''
      });
      setImageFile(null);
      setImagePreview('');
      loadTickets();
      toast.success('Ticket updated successfully!');
    } catch (error) {
      toast.error('Failed to update ticket');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleDeleteTicketClick = (ticket: any) => {
    setTicketToDelete(ticket);
    setShowDeleteTicketDialog(true);
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    try {
      await ticketsAPI.delete(ticketToDelete.id);
      loadTickets();
      toast.success('Ticket deleted successfully!');
      setShowDeleteTicketDialog(false);
      setTicketToDelete(null);
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleValidateTicket = async (inputValue?: string) => {
    const valueToValidate = inputValue || ticketNumber || qrCode || '';
    
    if (!valueToValidate || typeof valueToValidate !== 'string' || !valueToValidate.trim()) {
      toast.error('Please enter a ticket number or scan QR code');
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          qr_code: valueToValidate,
          admin_user: user?.username || 'Admin'
        }),
      });
      
      const result = await response.json();
      setValidationResult(result);
      
      if (result.success) {
        toast.success('Ticket validated successfully!');
      } else {
        const errorMessage = result.message || result.error || 'Ticket validation failed';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Failed to validate ticket - Network error');
      setValidationResult({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setIsValidating(false);
    }
  }

  const handleQRScan = (scannedValue: string) => {
    setQrCode(scannedValue);
    setIsScanning(false);
    handleValidateTicket(scannedValue);
  }

  const resetValidation = () => {
    setValidationResult(null)
    setQrCode('')
    setTicketNumber('')
  }

  const handleValidateAllTickets = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a Purchase ID');
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/tickets/validate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchase_id: qrCode,
          admin_user: user?.username || 'Admin'
        })
      });

      const result = await response.json();
      setValidationResult(result);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Validation failed');
      }
    } catch (error) {
      toast.error('Failed to validate tickets');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  console.log('📊 Admin page render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user ? user.username : 'NULL');
  
  // Show loading while authentication is being checked
  if (loading) {
    console.log('⏳ Showing loading screen - auth still loading');
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mb-4"></div>
          <p className="text-[#1a233b] font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show login button
  if (!isAuthenticated || !user) {
    console.log('⏳ Not authenticated - showing login button');
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-[#1a233b] mb-6">Admin Access Required</h2>
          <p className="text-gray-600 mb-6 text-center">You need to login to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-[#FFD700] hover:bg-[#FFC700] text-[#1a233b] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering admin dashboard - activeMenu:', activeMenu);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1a233b] text-white p-4 z-50 flex items-center justify-between">
        <div className="font-serif text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Hotel 734 Admin</div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 hover:bg-[#2a3447] rounded-md transition-colors"
        >
          {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static w-64 bg-[#1a233b] text-white min-h-screen z-50 lg:z-10 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 lg:p-6 h-full flex flex-col">
            <div className="font-serif text-xl lg:text-2xl mb-6 lg:mb-8 mt-12 lg:mt-0" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Hotel 734 Admin</div>
            <nav className="space-y-2 flex-1 overflow-y-auto">
          <SidebarItem label="Dashboard" active={activeMenu === "dashboard"} onClick={() => { setActiveMenu("dashboard"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          <SidebarItem label="Rooms" active={activeMenu === "rooms"} onClick={() => setActiveMenu("rooms")}/>
          {activeMenu === "rooms" && (
            <div className="ml-4 space-y-1">
              <SidebarSubItem label="Royal Suite" active={activeSubMenu === "royal_suite"} onClick={() => { setActiveSubMenu("royal_suite"); setIsMobileSidebarOpen(false); }} />
              <SidebarSubItem label="Superior Room" active={activeSubMenu === "superior_room"} onClick={() => { setActiveSubMenu("superior_room"); setIsMobileSidebarOpen(false); }} />
              <SidebarSubItem label="Classic Room" active={activeSubMenu === "classic_room"} onClick={() => { setActiveSubMenu("classic_room"); setIsMobileSidebarOpen(false); }} />
            </div>
          )}
          <SidebarItem label="Events" active={activeMenu === "events"} onClick={() => { setActiveMenu("events"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          {activeMenu === "events" && (
            <div className="ml-4 space-y-1">
              <SidebarSubItem label="Conference" active={activeSubMenu === "conference"} onClick={() => { setActiveSubMenu("conference"); setIsMobileSidebarOpen(false); }} />
              <SidebarSubItem label="Compound" active={activeSubMenu === "compound"} onClick={() => { setActiveSubMenu("compound"); setIsMobileSidebarOpen(false); }} />
            </div>
          )}
          <SidebarItem label="Tickets" active={activeMenu === "tickets"} onClick={() => { setActiveMenu("tickets"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          <SidebarItem label="Ticket Validation" active={activeMenu === "ticket-validation"} onClick={() => { setActiveMenu("ticket-validation"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          <SidebarItem label="Messages" active={activeMenu === "messages"} onClick={() => { setActiveMenu("messages"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          <SidebarItem label="Trash" active={activeMenu === "trash"} onClick={() => { setActiveMenu("trash"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
          <SidebarItem label="Security" active={activeMenu === "security"} onClick={() => { setActiveMenu("security"); setActiveSubMenu(""); setIsMobileSidebarOpen(false); }} />
              <SidebarItem label="Logout" active={false} onClick={async () => {
                console.log('Admin logout clicked');
                await logout();
                router.push('/admin/login');
              }} />
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 pt-20 lg:pt-6">
          {/* Header */}
          {activeMenu === 'dashboard' && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <h1 className="font-serif text-2xl sm:text-3xl text-[#1a233b]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Dashboard Overview
              </h1>
              <Button 
                onClick={() => setIsNewBookingDialogOpen(true)}
                className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold px-4 sm:px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          )}
          {/* Dashboard Content */}
        {/* Dashboard Content */}
        {activeMenu === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
                <h3 className="text-sm sm:text-base text-gray-500 mb-2">Available Rooms</h3>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a233b] mb-1">{15 - stats.totalBookings}</h2>
                <p className="text-xs text-gray-400">Ready for guests</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
                <h3 className="text-sm sm:text-base text-gray-500 mb-2">Total Revenue</h3>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a233b] mb-1">GH₵{stats.totalRevenue}</h2>
                <p className="text-xs text-gray-400">From bookings</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center">
                <h3 className="text-sm sm:text-base text-gray-500 mb-2">Pending Bookings</h3>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a233b] mb-1">{stats.pendingBookings}</h2>
                <p className="text-xs text-gray-400">Need attention</p>
              </div>
            </div>
            {/* Room Availability */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="font-bold text-lg sm:text-xl text-[#FFD700] mb-3 sm:mb-4">Room Availability</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {calculateRoomAvailability().map((room: any) => {
                  const percent = (room.available / room.total) * 100;
                  return (
                    <div key={room.label} className="bg-[#f8f9fa] rounded-lg p-4 border-l-4 border-[#FFD700]">
                      <h3 className="text-lg text-[#1a233b] mb-2">{room.label}</h3>
                      <div className="h-2 bg-gray-200 rounded mb-2">
                        <div className="h-2 rounded bg-[#FFD700] transition-all" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-sm text-gray-600">{room.available} of {room.total} available</p>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 overflow-x-auto">
              <h2 className="font-bold text-lg sm:text-xl text-[#FFD700] mb-4">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">ID</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Guest</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm hidden sm:table-cell">Check-In</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm hidden sm:table-cell">Check-Out</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Type</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Status</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Amount</th>
                      <th className="py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm">#{booking.id.slice(0, 6)}</td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm">
                        <div className="max-w-[100px] sm:max-w-none truncate">
                          {booking.guest_name || booking.guestName}
                        </div>
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm hidden sm:table-cell">{new Date(booking.start_date || booking.startDate).toLocaleDateString()}</td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm hidden sm:table-cell">{new Date(booking.end_date || booking.endDate).toLocaleDateString()}</td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm">
                        <div className="max-w-[80px] sm:max-w-none truncate">
                          {booking.booking_type === 'room' || booking.bookingType === 'room' 
                            ? (() => {
                                const roomType = booking.item_id || booking.itemId || 'Room';
                                return roomType === 'royal_suite' ? 'Royal' : 
                                       roomType === 'superior_room' ? 'Superior' : 
                                       roomType === 'classic_room' ? 'Classic' : 
                                       roomType === 'expensive' ? 'Royal' : 
                                       roomType === 'standard' ? 'Superior' : 
                                       roomType === 'regular' ? 'Classic' : 
                                       `${roomType.charAt(0).toUpperCase() + roomType.slice(1)}`;
                              })()
                            : (booking.item_id || booking.itemId || 'Event').charAt(0).toUpperCase() + (booking.item_id || booking.itemId || 'Event').slice(1)}
                        </div>
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm">
                        <span className={`px-1 sm:px-2 py-1 rounded text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold">GHC {booking.total_price || booking.totalPrice}</td>
                      <td className="py-2 px-2 sm:px-3">
                        <div className="flex gap-1 sm:gap-2">
                          {(booking.status !== 'completed' && booking.status !== 'cancelled') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-500 text-white hover:bg-blue-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => handleUpdateStatus(booking)}
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500 text-white hover:bg-red-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 px-3 text-center text-gray-500">
                        No bookings found. Bookings will appear here when customers make reservations.
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Room Management */}
        {activeMenu === 'rooms' && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-[#1a233b]">Room Management</h2>
            
            {/* Room Types Overview */}
            {!activeSubMenu && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(TOTAL_ROOMS).map(([roomType, totalCount]) => {
                  const roomBookings = getRoomBookings(roomType);
                  const currentlyOccupied = getCurrentlyOccupiedRooms(roomType);
                  const occupiedCount = currentlyOccupied.length;
                  const availableCount = totalCount - occupiedCount;
                  const roomName = roomType === 'royal_suite' ? 'Royal Suite' : 
                                 roomType === 'superior_room' ? 'Superior Room' : 'Classic Room';
                  
                  return (
                    <div key={roomType} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                         onClick={() => setActiveSubMenu(roomType)}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#1a233b]">{roomName}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#FFD700]">{availableCount}</div>
                          <div className="text-sm text-gray-500">Available</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-700">{totalCount}</div>
                          <div className="text-xs text-green-600">Total Rooms</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-semibold text-red-700">{occupiedCount}</div>
                          <div className="text-xs text-red-600">Currently Occupied</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Total Bookings:</strong> {roomBookings.length > 0 ? roomBookings.length : 'None'}
                        <br />
                        <strong>Currently Occupied:</strong> {occupiedCount > 0 ? occupiedCount : 'None'}
                      </div>
                      
                      {roomBookings.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 font-medium">Recent Bookings:</div>
                          {roomBookings.slice(0, 2).map((booking) => (
                            <div key={booking.id} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-medium">{booking.guest_name || booking.guestName}</div>
                              <div className="text-gray-500">
                                {new Date(booking.start_date || booking.startDate).toLocaleDateString()} - 
                                {new Date(booking.end_date || booking.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                          {roomBookings.length > 2 && (
                            <div className="text-xs text-gray-400">+{roomBookings.length - 2} more bookings</div>
                          )}
                        </div>
                      )}
                      
                      <button className="w-full mt-4 bg-[#FFD700] hover:bg-[#FFC700] text-[#1a233b] font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                        View All Bookings
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {activeSubMenu && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#1a233b]">
                    {activeSubMenu === 'royal_suite' ? 'Royal Suite' : activeSubMenu === 'superior_room' ? 'Superior Room' : 'Classic Room'} Bookings
                  </h3>
                  <button 
                    onClick={() => setActiveSubMenu('')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    ← Back to Rooms
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">Booking ID</th>
                        <th className="py-2 px-3 text-left">Guest Name</th>
                        <th className="py-2 px-3 text-left">Check In</th>
                        <th className="py-2 px-3 text-left">Check Out</th>
                        <th className="py-2 px-3 text-left">Guests</th>
                        <th className="py-2 px-3 text-left">Special Requests</th>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-left">Amount</th>
                        <th className="py-2 px-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRoomBookings(activeSubMenu).map((booking) => (
                        <tr key={booking.id} className="border-b last:border-0">
                          <td className="py-2 px-3">#{booking.id.slice(0, 8)}</td>
                          <td className="py-2 px-3">{booking.guest_name || booking.guestName}</td>
                          <td className="py-2 px-3">{new Date(booking.start_date || booking.startDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3">{new Date(booking.end_date || booking.endDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3">{booking.guests_count || booking.numberOfGuests}</td>
                          <td className="py-2 px-3">
                            <div className="max-w-xs">
                              {booking.special_requests || booking.specialRequests ? (
                                <span className="text-sm text-gray-700 truncate block" title={booking.special_requests || booking.specialRequests}>
                                  {booking.special_requests || booking.specialRequests}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">None</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3">GHC {booking.total_price || booking.totalPrice}</td>
                          <td className="py-2 px-3">
                            <div className="flex gap-2">
                              {(booking.status !== 'completed' && booking.status !== 'cancelled') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-500 text-white hover:bg-blue-600"
                                  onClick={() => handleUpdateStatus(booking)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500 text-white hover:bg-red-600"
                                onClick={() => handleDeleteBooking(booking.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getRoomBookings(activeSubMenu).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 px-3 text-center text-gray-500">
                            No {activeSubMenu === 'royal_suite' ? 'Royal Suite' : activeSubMenu === 'superior_room' ? 'Superior Room' : 'Classic Room'} bookings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Event Management */}
        {activeMenu === 'events' && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-[#1a233b]">Event Management</h2>
            
            {/* Event Types Overview */}
            {!activeSubMenu && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['conference', 'compound'].map((eventType) => {
                  const eventBookings = getEventBookings(eventType);
                  const eventName = eventType.charAt(0).toUpperCase() + eventType.slice(1);
                  const upcomingEvents = eventBookings.filter(booking => {
                    const eventDate = new Date(booking.start_date || booking.startDate);
                    return eventDate >= new Date();
                  });
                  const pastEvents = eventBookings.length - upcomingEvents.length;
                  
                  return (
                    <div key={eventType} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                         onClick={() => setActiveSubMenu(eventType)}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#1a233b]">{eventName} Events</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#FFD700]">{upcomingEvents.length}</div>
                          <div className="text-sm text-gray-500">Upcoming</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-700">{eventBookings.length}</div>
                          <div className="text-xs text-blue-600">Total Bookings</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-700">{pastEvents}</div>
                          <div className="text-xs text-gray-600">Past Events</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>Active Bookings:</strong> {eventBookings.length > 0 ? eventBookings.length : 'None'}
                      </div>
                      
                      {upcomingEvents.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 font-medium">Upcoming Events:</div>
                          {upcomingEvents.slice(0, 2).map((booking) => (
                            <div key={booking.id} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-medium">{booking.guest_name || booking.guestName}</div>
                              <div className="text-gray-500">
                                {new Date(booking.start_date || booking.startDate).toLocaleDateString()} - 
                                {booking.guests_count || booking.numberOfGuests} guests
                              </div>
                            </div>
                          ))}
                          {upcomingEvents.length > 2 && (
                            <div className="text-xs text-gray-400">+{upcomingEvents.length - 2} more upcoming</div>
                          )}
                        </div>
                      )}
                      
                      {upcomingEvents.length === 0 && eventBookings.length > 0 && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          No upcoming events. {pastEvents} past events completed.
                        </div>
                      )}
                      
                      <button className="w-full mt-4 bg-[#FFD700] hover:bg-[#FFC700] text-[#1a233b] font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                        View All Bookings
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Event Bookings (Conference/Compound) */}
        {activeMenu === 'events' && activeSubMenu && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-2xl text-[#1a233b]">
                {activeSubMenu.charAt(0).toUpperCase() + activeSubMenu.slice(1)} Event Bookings
              </h2>
              <button 
                onClick={() => setActiveSubMenu('')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                ← Back to Events
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">Booking ID</th>
                      <th className="py-2 px-3 text-left">Guest Name</th>
                      <th className="py-2 px-3 text-left">Event Date</th>
                      <th className="py-2 px-3 text-left">Guests</th>
                      <th className="py-2 px-3 text-left">Special Requests</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Amount</th>
                      <th className="py-2 px-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getEventBookings(activeSubMenu).map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-2 px-3">#{booking.id.slice(0, 8)}</td>
                        <td className="py-2 px-3">{booking.guest_name || booking.guestName}</td>
                        <td className="py-2 px-3">{new Date(booking.start_date || booking.startDate).toLocaleDateString()}</td>
                        <td className="py-2 px-3">{booking.guests_count || booking.numberOfGuests}</td>
                        <td className="py-2 px-3">
                          <div className="max-w-xs">
                            {booking.special_requests || booking.specialRequests ? (
                              <span className="text-sm text-gray-700 truncate block" title={booking.special_requests || booking.specialRequests}>
                                {booking.special_requests || booking.specialRequests}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-3">GHC {booking.total_price || booking.totalPrice}</td>
                        <td className="py-2 px-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {getEventBookings(activeSubMenu).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 px-3 text-center text-gray-500">
                          No {activeSubMenu} event bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Management */}
        {activeMenu === 'tickets' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-bold text-2xl text-[#1a233b]">Tickets Management</h2>
                <p className="text-gray-600 mt-1">Create and manage event tickets for your hotel</p>
              </div>
              <Button
                onClick={() => {
                  setIsEditingTicket(false);
                  setCurrentTicket(null);
                  setTicketForm({
                    title: '',
                    description: '',
                    activity_type: '',
                    event_date: '',
                    event_time: '',
                    price: '',
                    total_quantity: '',
                    image_url: '',
                    venue: ''
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setIsTicketDialogOpen(true);
                }}
                className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
            </div>

            {/* Stats Cards */}
            {!isLoadingTickets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Tickets</p>
                      <p className="text-2xl font-bold">{tickets.length}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-blue-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Tickets</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'active').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Sales</p>
                      <p className="text-2xl font-bold">{ticketPurchases.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Revenue</p>
                      <p className="text-2xl font-bold">
                        GHC {ticketPurchases.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Grid */}
            {isLoadingTickets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded w-10"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => {
                  // Check if ticket is expired
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const eventDate = new Date(ticket.event_date);
                  eventDate.setHours(0, 0, 0, 0);
                  const isExpired = eventDate < today;
                  
                  // Check if ticket is sold out
                  const isSoldOut = ticket.available_quantity <= 0;
                  
                  return (
                    <div key={ticket.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {ticket.image_url ? (
                        <div className="h-48 bg-gray-200 overflow-hidden relative">
                          <img
                            src={ticket.image_url}
                            alt={ticket.title}
                            className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${isExpired ? 'grayscale opacity-60' : ''}`}
                          />
                          {/* Status overlays */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {isExpired && (
                              <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                                INACTIVE
                              </span>
                            )}
                            {!isExpired && isSoldOut && (
                              <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                          <Ticket className={`h-16 w-16 ${isExpired ? 'text-gray-300' : 'text-gray-400'}`} />
                          {/* Status overlays */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {isExpired && (
                              <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                                INACTIVE
                              </span>
                            )}
                            {!isExpired && isSoldOut && (
                              <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className={`text-xl font-bold line-clamp-1 ${isExpired ? 'text-gray-500' : 'text-[#1a233b]'}`}>{ticket.title}</h3>
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ticket.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.status}
                            </span>
                            {isExpired && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 text-center">
                                Expired
                              </span>
                            )}
                            {!isExpired && isSoldOut && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 text-center">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{ticket.description}</p>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                          <span className="font-medium">
                            {new Date(ticket.event_date).toLocaleDateString()} at {ticket.event_time}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <DollarSign className="h-4 w-4 mr-3 text-green-500" />
                          <span className="font-bold text-green-600">GHC {ticket.price}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-4 w-4 mr-3 text-purple-500" />
                          <span>
                            <span className="font-medium">{ticket.available_quantity || ticket.total_quantity}</span>
                            <span className="text-gray-500"> / {ticket.total_quantity} available</span>
                          </span>
                        </div>
                        {ticket.venue && (
                          <div className="flex items-center text-gray-700">
                            <span className="mr-3 text-red-500">📍</span>
                            <span className="truncate">{ticket.venue}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTicket(ticket)}
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTicketClick(ticket)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
                
                {!isLoadingTickets && tickets.length === 0 && (
                  <div className="col-span-full">
                    <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                      <div className="mb-6">
                        <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Created Yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Create your first event ticket to start selling experiences to your hotel guests.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setIsEditingTicket(false);
                          setCurrentTicket(null);
                          setTicketForm({
                            title: '',
                            description: '',
                            activity_type: '',
                            event_date: '',
                            event_time: '',
                            price: '',
                            total_quantity: '',
                            image_url: '',
                            venue: ''
                          });
                          setImageFile(null);
                          setImagePreview('');
                          setIsTicketDialogOpen(true);
                        }}
                        className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Purchases */}
            {!isLoadingTickets && ticketPurchases.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h3 className="text-xl font-bold text-[#1a233b]">Recent Ticket Purchases</h3>
                  <p className="text-gray-600 text-sm mt-1">Latest customer ticket purchases</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketPurchases.slice(0, 10).map((purchase) => {
                        const ticket = tickets.find(t => t.id === purchase.ticket_id);
                        return (
                          <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                              #{purchase.id.slice(0, 8)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">
                              {ticket?.title || 'Unknown Ticket'}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">
                              {purchase.customer_name}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-700">
                              {purchase.quantity}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-green-600">
                              GHC {purchase.total_amount}
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                purchase.payment_status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : purchase.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {purchase.payment_status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {new Date(purchase.purchase_date).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Settings */}
        {activeMenu === 'security' && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-[#1a233b]">Security Settings</h2>
            
            {/* Admin Account Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-[#1a233b] mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-900">{user?.username}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-900">{user?.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-900">{user?.full_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-900 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-[#1a233b] mb-4">Password Management</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                      <p className="mt-1 text-sm text-yellow-700">
                        Your admin credentials are now stored securely in the database with encrypted passwords. 
                        Regular password changes are recommended for optimal security.
                      </p>
                    </div>
                  </div>
                </div>
                
                <ChangePasswordDialog>
                  <Button className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold">
                    Change Password
                  </Button>
                </ChangePasswordDialog>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-[#1a233b] mb-4">Security Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Password encryption (bcrypt)</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Account lockout protection</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Failed login attempt tracking</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Database-level security</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Secure password generation</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">Emergency recovery process</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Recovery Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-[#1a233b] mb-4">Emergency Recovery</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Account Recovery Process</h4>
                    <div className="mt-2 text-sm text-red-700">
                      <p className="mb-2">If you lose access to your admin account:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Contact the system administrator or database admin</li>
                        <li>Provide proof of identity and authorization</li>
                        <li>Database admin can use the emergency reset function</li>
                        <li>A new secure password will be generated</li>
                      </ol>
                      <p className="mt-2 font-medium">Emergency reset function: <code className="bg-red-100 px-1 rounded">emergency_reset_admin_password()</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Management */}
        {activeMenu === 'messages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-bold text-2xl text-[#1a233b]">Messages & Reviews</h2>
              <div className="flex items-center gap-3">
                {unreadMessages > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    {unreadMessages} unread
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Total: {messages.length} messages
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Message List */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC700] px-6 py-4">
                  <h3 className="font-bold text-[#1a233b] text-lg">Inbox</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 text-lg mb-2">📭</div>
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {messages.map(msg => (
                        <div 
                          key={msg.id || msg.uuid || msg.message_id} 
                          className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                            !msg.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          } ${
                            selectedMessage && (selectedMessage.id === msg.id || selectedMessage.uuid === msg.uuid || selectedMessage.message_id === msg.message_id) 
                              ? 'bg-[#FFFBEA] border-l-4 border-[#FFD700]' : ''
                          }`}
                          onClick={() => {
                            setSelectedMessage(msg);
                            // Auto-mark as read when message is opened
                            if (!msg.is_read) {
                              handleMarkAsRead(msg.id || msg.uuid || msg.message_id);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900 truncate flex-1">
                              {msg.name}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              {msg.type === 'review' && msg.rating && (
                                <div className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                  ⭐ {msg.rating}
                                </div>
                              )}
                              {msg.replied_at && (
                                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                  ✓ Replied
                                </div>
                              )}
                              {!msg.is_read && (
                                <div className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  New
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 truncate mb-1">
                            {msg.type === 'review' ? (
                              <span className="text-blue-600 font-medium">
                                Review: {msg.booking_id ? `Booking #${msg.booking_id}` : msg.title}
                              </span>
                            ) : (
                              msg.subject || msg.title || 'No subject'
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border">
                {!selectedMessage ? (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Select a message</h3>
                    <p className="text-sm">Choose a message from the inbox to view details</p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Message Header */}
                    <div className="border-b pb-4 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {selectedMessage.type === 'review' ? (
                              <>
                                <h2 className="text-xl font-bold text-[#1a233b]">Customer Review</h2>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={`text-lg ${star <= selectedMessage.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                      ⭐
                                    </span>
                                  ))}
                                  <span className="ml-1 text-sm text-gray-600 font-medium">
                                    ({selectedMessage.rating}/5)
                                  </span>
                                </div>
                              </>
                            ) : (
                              <h2 className="text-xl font-bold text-[#1a233b]">
                                {selectedMessage.subject || selectedMessage.title || 'Message'}
                              </h2>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-700">
                              <span className="font-medium">From:</span> {selectedMessage.name}
                              {selectedMessage.email && (
                                <span className="text-gray-500 ml-1">({selectedMessage.email})</span>
                              )}
                            </div>
                            {selectedMessage.booking_id && (
                              <div className="text-blue-600 font-medium">
                                Booking: #{selectedMessage.booking_id} ({selectedMessage.booking_type} - {selectedMessage.item_name})
                              </div>
                            )}
                            <div className="text-gray-500">
                              {new Date(selectedMessage.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {selectedMessage.email && (
                            <Button 
                              size="sm" 
                              onClick={handleReplyMessage}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Reply
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {selectedMessage.message}
                      </div>
                    </div>

                    {/* Reply Status */}
                    {selectedMessage.replied_at && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">
                            Replied on {new Date(selectedMessage.replied_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Message</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>To:</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> Re: {selectedMessage.subject || 'Your message to Hotel 734'}
                  </div>
                </div>
                <div>
                  <Label htmlFor="reply-content">Your Reply</Label>
                  <Textarea
                    id="reply-content"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={8}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendReply}
                    disabled={!replyContent.trim()}
                    className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b]"
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Trash */}
        {activeMenu === 'trash' && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-[#1a233b]">Deleted Bookings</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">Booking ID</th>
                      <th className="py-2 px-3 text-left">Guest Name</th>
                      <th className="py-2 px-3 text-left">Type</th>
                      <th className="py-2 px-3 text-left">Amount</th>
                      <th className="py-2 px-3 text-left">Deleted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashedBookings.map((booking, index) => (
                      <tr key={`${booking.id}-${index}`} className="border-b last:border-0 opacity-60">
                        <td className="py-2 px-3">#{booking.id.slice(0, 8)}</td>
                        <td className="py-2 px-3">{booking.guest_name || booking.guestName}</td>
                        <td className="py-2 px-3">
                          {booking.booking_type === 'room' || booking.bookingType === 'room' 
                            ? `${(booking.item_id || booking.itemId).charAt(0).toUpperCase() + (booking.item_id || booking.itemId).slice(1)} Room`
                            : (booking.item_id || booking.itemId || 'Event').charAt(0).toUpperCase() + (booking.item_id || booking.itemId || 'Event').slice(1)
                          }
                        </td>
                        <td className="py-2 px-3">GHC {booking.total_amount || booking.totalAmount}</td>
                        <td className="py-2 px-3">{new Date(booking.deletedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {trashedBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 px-3 text-center text-gray-500">
                          No deleted bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Validation */}
        {activeMenu === 'ticket-validation' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-bold text-xl sm:text-2xl text-[#1a233b]">Ticket Validation</h2>
              <Button onClick={resetValidation} variant="outline" className="w-full sm:w-auto">
                <Scan className="h-4 w-4 mr-2" />
                New Scan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Ticket Validation */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl border border-emerald-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-900 flex items-center gap-2">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    Ticket Validation
                  </h3>
                  <div className="bg-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                    Admin Only
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {/* Manual Entry */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-100">
                    <Label htmlFor="ticket-input" className="text-emerald-900 font-medium text-sm sm:text-base">
                      Enter Ticket Number
                    </Label>
                    <div className="mt-2 flex flex-col sm:flex-row gap-2">
                      <Input
                        id="ticket-input"
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="Enter ticket number (e.g., TKT-123456)"
                        className="flex-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm sm:text-base"
                      />
                      <Button 
                        onClick={() => handleValidateTicket()}
                        disabled={isValidating || !qrCode.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-6 w-full sm:w-auto"
                        type="button"
                      >
                        {isValidating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validate
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Enter the ticket number shown on the customer's ticket
                    </p>
                  </div>

                  {/* QR Scanner */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <Label className="text-emerald-900 font-medium text-sm sm:text-base">QR Code Scanner</Label>
                      <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded self-start sm:self-auto">
                        Camera Required
                      </div>
                    </div>
                    
                    {!isScanning ? (
                      <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
                        <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">Point camera at QR code to scan</p>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                          onClick={() => setIsScanning(true)}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <QRScanner 
                          onScan={handleQRScan}
                          onError={(error) => {
                            toast.error('Camera access failed');
                            setIsScanning(false);
                          }}
                        />
                        <Button 
                          variant="outline"
                          onClick={() => setIsScanning(false)}
                          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <CameraOff className="h-4 w-4 mr-2" />
                          Stop Camera
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-emerald-700 mt-2">
                      Point camera at customer's QR code to automatically validate
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Result */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Validation Result</h3>
                  {validationResult && (
                    <Button 
                      onClick={resetValidation}
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto"
                    >
                      Clear Result
                    </Button>
                  )}
                </div>
                
                {!validationResult ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-emerald-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Ready to Validate</h4>
                    <p className="text-gray-600 text-sm sm:text-base px-4">Enter ticket number or scan QR code to validate entry</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validationResult.success ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-green-600 rounded-full p-2 flex-shrink-0">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-green-900 text-base sm:text-lg">✅ VALID TICKET</h4>
                            <p className="text-green-700 text-sm sm:text-base">Entry approved - Welcome to the event!</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 sm:p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-600">Event:</span>
                              <p className="font-semibold text-gray-900 break-words">{validationResult.ticket?.event?.title || validationResult.ticket?.event?.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Date & Time:</span>
                              <p className="font-semibold text-gray-900">
                                {validationResult.ticket?.event?.event_date} at {validationResult.ticket?.event?.event_time}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Venue:</span>
                              <p className="font-semibold text-gray-900">{validationResult.ticket?.event?.venue}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Ticket Holder:</span>
                              <p className="font-semibold text-gray-900">{validationResult.ticket?.holder_name}</p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 text-xs text-gray-600">
                            <p>Validated by: {validationResult.ticket?.used_by}</p>
                            <p>Validated at: {new Date(validationResult.ticket?.used_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-red-600 rounded-full p-2 flex-shrink-0">
                            <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-red-900 text-base sm:text-lg">❌ INVALID TICKET</h4>
                            <p className="text-red-700 text-sm sm:text-base break-words">{validationResult.message || validationResult.error || 'Ticket validation failed'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-red-800 font-medium mb-3">{validationResult.message}</p>
                          
                          {validationResult.ticket && (
                            <div className="space-y-2 text-sm border-t pt-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-gray-600">Event:</span>
                                  <p className="font-semibold">{validationResult.ticket?.event?.title || validationResult.ticket?.event?.name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Holder:</span>
                                  <p className="font-semibold">{validationResult.ticket?.holder_name}</p>
                                </div>
                              </div>
                              
                              {validationResult.used_at && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                  Previously used: {new Date(validationResult.used_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Booking Status</DialogTitle>
            </DialogHeader>
            {bookingToUpdate && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Booking ID: #{bookingToUpdate.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">Guest: {bookingToUpdate.guest_name || bookingToUpdate.guestName}</p>
                  <p className="text-sm text-gray-600">Current Status: <span className="font-semibold">{bookingToUpdate.status}</span></p>
                </div>
                <div>
                  <Label htmlFor="status">New Status</Label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C49B66] focus:border-[#C49B66]"
                  >
                    <option value="">Select new status...</option>
                    {bookingToUpdate?.status === 'confirmed' && (
                      <>
                        <option value="checked-in">Checked In</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
                    {bookingToUpdate?.status === 'checked-in' && (
                      <>
                        <option value="completed">Completed</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmStatusUpdate}
                    disabled={isUpdatingStatus}
                    className={`bg-[#C49B66] hover:bg-[#b8905c] text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      isUpdatingStatus ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUpdatingStatus ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        <span>Updating Status...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        <span>Update Status</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Enhanced Ticket Create/Edit Dialog */}
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[#FFD700] rounded-lg">
                  <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-[#1a233b]" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-[#1a233b]">
                    {isEditingTicket ? 'Edit Ticket' : 'Create New Ticket'}
                  </DialogTitle>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {isEditingTicket ? 'Update ticket information and settings' : 'Create an exciting experience ticket for your hotel guests'}
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-6 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-[#FFD700] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>Ticket Title</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Luxury Spa Day Experience"
                      className="h-12 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activity_type" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>Activity Category</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="activity_type"
                      value={ticketForm.activity_type}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, activity_type: e.target.value }))}
                      className="h-12 w-full px-4 border border-gray-300 rounded-md focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-20"
                    >
                      <option value="">Select a category</option>
                      <option value="Wellness">🧘 Wellness & Spa</option>
                      <option value="Adventure">🏔️ Adventure & Sports</option>
                      <option value="Cultural">🎭 Cultural Experience</option>
                      <option value="Dining">🍽️ Fine Dining</option>
                      <option value="Entertainment">🎵 Entertainment</option>
                      <option value="Business">💼 Business & Events</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the amazing experience your guests will enjoy..."
                    rows={4}
                    className="border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700] resize-none"
                  />
                </div>
              </div>

              {/* Event Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Event Details</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="event_date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Event Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={ticketForm.event_date}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, event_date: e.target.value }))}
                      className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event_time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Start Time</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={ticketForm.event_time}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, event_time: e.target.value }))}
                      className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="venue" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">📍</span>
                      <span>Venue</span>
                    </Label>
                    <Input
                      id="venue"
                      value={ticketForm.venue}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="e.g., Hotel Spa, Pool Area"
                      className="h-11 sm:h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Availability Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Pricing & Availability</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>Price (GHC)</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={ticketForm.price}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="150.00"
                        className="h-11 sm:h-12 pl-8 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 font-medium">₵</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total_quantity" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Total Spots</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="total_quantity"
                      type="number"
                      min="1"
                      value={ticketForm.total_quantity}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, total_quantity: e.target.value }))}
                      placeholder="50"
                      className="h-11 sm:h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Ticket Image</h3>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="image_upload" className="text-sm font-medium text-gray-700">
                    Upload an attractive image for your ticket
                  </Label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onload = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    
                    {!imagePreview ? (
                      <label htmlFor="image_upload" className="cursor-pointer flex flex-col items-center justify-center py-8">
                        <div className="p-3 bg-purple-100 rounded-full mb-4">
                          <Camera className="h-8 w-8 text-purple-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-700 mb-2">Click to upload image</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="flex gap-2">
                            <label htmlFor="image_upload" className="bg-white text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              Change Image
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTicketDialogOpen(false);
                    setIsEditingTicket(false);
                    setCurrentTicket(null);
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={isEditingTicket ? handleUpdateTicket : handleCreateTicket}
                  disabled={isCreatingTicket || isUpdatingTicket}
                  className={`px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC700] hover:from-[#e6c200] hover:to-[#e6b800] text-[#1a233b] font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    (isCreatingTicket || isUpdatingTicket) ? 'opacity-80 cursor-not-allowed transform-none' : ''
                  }`}
                >
                  {isCreatingTicket ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a233b] mr-3"></div>
                      <span>Creating Ticket...</span>
                    </div>
                  ) : isUpdatingTicket ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a233b] mr-3"></div>
                      <span>Updating Ticket...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Plus className="mr-2 h-5 w-5" />
                      <span>{isEditingTicket ? 'Update Ticket' : 'Create Ticket'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Ticket Confirmation Dialog */}
        <Dialog open={showDeleteTicketDialog} onOpenChange={setShowDeleteTicketDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Ticket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-red-700">
                  You are about to permanently delete:
                </p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <p className="font-semibold text-gray-900">{ticketToDelete?.title}</p>
                  <p className="text-sm text-gray-600">{ticketToDelete?.activity_type}</p>
                  <p className="text-sm text-gray-600">Price: GHC {ticketToDelete?.price}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteTicketDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDeleteTicket}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Booking Dialog */}
        <Dialog open={isNewBookingDialogOpen} onOpenChange={setIsNewBookingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD700] rounded-lg">
                  <Calendar className="h-6 w-6 text-[#1a233b]" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-[#1a233b]">
                    Create New Booking
                  </DialogTitle>
                  <p className="text-gray-600 mt-1">
                    Book a room for a walk-in customer or phone booking
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-6 space-y-8">
              {/* Guest Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-[#FFD700] rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Guest Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="guestName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Guest Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="guestName"
                      value={bookingForm.guestName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                      placeholder="Enter guest's full name"
                      className="h-12 border-gray-300 focus:border-[#FFD700] focus:ring-[#FFD700]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>📞</span>
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Guest's phone number"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span>📧</span>
                    <span>Email Address</span>
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="guest@example.com"
                    className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Booking Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>🏨</span>
                      <span>Room Type</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="roomType"
                      value={bookingForm.roomType}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, roomType: e.target.value }))}
                      className="h-12 w-full px-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                    >
                      <option value="">Select room type</option>
                      <option value="royal_suite">👑 Royal Suite - GHC 500/night</option>
                      <option value="superior_room">🏨 Superior Room - GHC 300/night</option>
                      <option value="classic_room">🛏️ Classic Room - GHC 200/night</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="checkIn" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>Check-in Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="checkOut" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span>Check-out Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-[#1a233b]">Booking Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>💰</span>
                      <span>Total Price</span>
                    </Label>
                    <div className="h-12 px-4 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                      <span className="text-lg font-bold text-green-600">
                        {bookingForm.roomType && bookingForm.checkIn && bookingForm.checkOut ? (() => {
                          const roomPrices = { 'royal_suite': 500, 'superior_room': 300, 'classic_room': 200 };
                          const checkInDate = new Date(bookingForm.checkIn);
                          const checkOutDate = new Date(bookingForm.checkOut);
                          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
                          const total = roomPrices[bookingForm.roomType as keyof typeof roomPrices] * Math.max(1, nights);
                          return `GHC ${total.toFixed(2)} (${Math.max(1, nights)} night${nights !== 1 ? 's' : ''})`;
                        })() : 'Select room and dates'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>📝</span>
                      <span>Special Requests</span>
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      id="specialRequests"
                      value={bookingForm.specialRequests}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Any special requests or preferences..."
                      rows={3}
                      className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewBookingDialogOpen(false);
                    setBookingForm({
                      guestName: '',
                      email: '',
                      phone: '',
                      roomType: '',
                      checkIn: '',
                      checkOut: '',
                      specialRequests: ''
                    });
                  }}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={isCreatingBooking}
                  className={`px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC700] hover:from-[#e6c200] hover:to-[#e6b800] text-[#1a233b] font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    isCreatingBooking ? 'opacity-80 cursor-not-allowed transform-none' : ''
                  }`}
                >
                  {isCreatingBooking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a233b] mr-3"></div>
                      <span>Processing Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Complete Booking</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`menu-item px-4 py-3 rounded-lg cursor-pointer transition font-semibold mb-1 ${active ? 'bg-[#FFD700] text-[#1a233b]' : 'hover:bg-[#FFD700] hover:text-[#1a233b] text-white'}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

function SidebarSubItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`sub-item px-4 py-2 rounded cursor-pointer transition text-sm mb-1 ${active ? 'bg-[#FFD700] text-[#1a233b]' : 'hover:bg-[#FFD700] hover:text-[#1a233b] text-white'}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}