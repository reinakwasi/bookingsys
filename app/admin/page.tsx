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
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [trashedBookings, setTrashedBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketPurchases, setTicketPurchases] = useState<any[]>([]);
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
    venue: '',
    duration_hours: '',
    status: 'active'
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

  useEffect(() => {
    console.log('Auth check - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

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
    try {
      const ticketsData = await ticketsAPI.getAll();
      const purchasesData = await ticketPurchasesAPI.getAll();
      setTickets(ticketsData);
      setTicketPurchases(purchasesData);
    } catch (error) {
      toast.error('Failed to load tickets');
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

  const handleMarkAsUnread = async (id: string) => {
    const msgType = selectedMessage?.type || 'review';
    await messagesAPI.markAsUnread(id, msgType);
    loadMessages();
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, is_read: false });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    await messagesAPI.delete(id);
    setSelectedMessage(null);
    loadMessages();
    toast.success('Message deleted');
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
        duration_hours: parseFloat(ticketForm.duration_hours)
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
        venue: '',
        duration_hours: '',
        status: 'active'
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
      venue: ticket.venue || '',
      duration_hours: ticket.duration_hours?.toString() || '',
      status: ticket.status
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
        total_quantity: parseInt(ticketForm.total_quantity),
        duration_hours: parseFloat(ticketForm.duration_hours)
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
        venue: '',
        duration_hours: '',
        status: 'active'
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
    console.log('=== handleValidateTicket CALLED ===');
    console.log('inputValue:', inputValue);
    console.log('ticketNumber:', ticketNumber);
    console.log('qrCode:', qrCode);
    
    const valueToValidate = inputValue || ticketNumber || qrCode || '';
    console.log('valueToValidate:', valueToValidate);
    
    if (!valueToValidate || typeof valueToValidate !== 'string' || !valueToValidate.trim()) {
      console.log('ERROR: No valid ticket number provided');
      toast.error('Please enter a ticket number or scan QR code');
      return;
    }

    console.log('=== FRONTEND VALIDATION START ===');
    console.log('Validating ticket:', valueToValidate);
    console.log('User:', user);
    console.log('Setting isValidating to true');
    setIsValidating(true);
    
    try {
      console.log('Making API request to /api/tickets/validate');
      const response = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          qr_code: valueToValidate,
          admin_user: user?.username || 'Admin'
        }),
      })

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        console.log('Response not OK, status:', response.status);
      }
      
      const result = await response.json()
      console.log('Validation result:', result);
      
      setValidationResult(result)
      
      if (result.success) {
        toast.success('Ticket validated successfully!')
      } else {
        const errorMessage = result.message || result.error || 'Ticket validation failed';
        console.log('Validation failed:', errorMessage);
        if (result.debug) {
          console.log('Debug info:', result.debug);
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Failed to validate ticket - Network error')
      setValidationResult({
        success: false,
        message: 'Network error occurred'
      })
    } finally {
      setIsValidating(false)
      console.log('=== FRONTEND VALIDATION END ===');
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

  console.log('Admin page render - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
  if (loading) {
    console.log('Still loading auth state...');
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login...');
    router.push('/admin/login');
    return <div>Redirecting to login...</div>;
  }

  console.log('Rendering admin dashboard - activeMenu:', activeMenu);

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
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

      {/* Sidebar */}
      <aside className={`${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static w-64 bg-[#1a233b] text-white p-4 lg:p-6 h-full z-50 lg:z-10 transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="font-serif text-xl lg:text-2xl mb-6 lg:mb-8 mt-12 lg:mt-0" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Hotel 734 Admin</div>
        <nav className="space-y-2">
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
          <SidebarItem label="Logout" active={false} onClick={() => window.location.reload()} />
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pt-20 lg:pt-6">
        {/* Header */}
        {activeMenu === 'dashboard' && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1a233b]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Dashboard Overview
            </h1>
            <button className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold px-4 sm:px-6 py-2 rounded-md shadow transition-all text-sm sm:text-base">+ New Booking</button>
          </div>
        )}
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
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a233b] mb-1">${stats.totalRevenue}</h2>
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
            
            {activeSubMenu && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-[#1a233b] mb-4">
                  {activeSubMenu === 'royal_suite' ? 'Royal Suite' : activeSubMenu === 'superior_room' ? 'Superior Room' : 'Classic Room'} Bookings
                </h3>
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


        {/* Event Bookings (Conference/Compound) */}
        {activeMenu === 'events' && activeSubMenu && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-[#1a233b]">
              {activeSubMenu.charAt(0).toUpperCase() + activeSubMenu.slice(1)} Event Bookings
            </h2>
            
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
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-2xl text-[#1a233b]">Tickets Management</h2>
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
                    venue: '',
                    duration_hours: '',
                    status: 'active'
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setIsTicketDialogOpen(true);
                }}
                className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {ticket.image_url && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={ticket.image_url}
                        alt={ticket.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-[#1a233b]">{ticket.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        ticket.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(ticket.event_date).toLocaleDateString()} at {ticket.event_time}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        GHC {ticket.price}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {ticket.available_quantity || ticket.total_quantity} / {ticket.total_quantity} available
                      </div>
                      {ticket.venue && (
                        <div className="flex items-center">
                          <span className="h-4 w-4 mr-2">📍</span>
                          {ticket.venue}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTicket(ticket)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTicketClick(ticket)}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No tickets created yet</div>
                  <p className="text-gray-500">Create your first ticket to get started</p>
                </div>
              )}
            </div>

            {/* Ticket Purchases Summary */}
            {ticketPurchases.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-[#1a233b] mb-4">Recent Ticket Purchases</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">Purchase ID</th>
                        <th className="py-2 px-3 text-left">Ticket</th>
                        <th className="py-2 px-3 text-left">Customer</th>
                        <th className="py-2 px-3 text-left">Quantity</th>
                        <th className="py-2 px-3 text-left">Total</th>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketPurchases.slice(0, 10).map((purchase) => {
                        const ticket = tickets.find(t => t.id === purchase.ticket_id);
                        return (
                          <tr key={purchase.id} className="border-b last:border-0">
                            <td className="py-2 px-3">#{purchase.id.slice(0, 8)}</td>
                            <td className="py-2 px-3">{ticket?.title || 'Unknown'}</td>
                            <td className="py-2 px-3">{purchase.customer_name}</td>
                            <td className="py-2 px-3">{purchase.quantity}</td>
                            <td className="py-2 px-3">GHC {purchase.total_amount}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                purchase.payment_status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : purchase.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {purchase.payment_status}
                              </span>
                            </td>
                            <td className="py-2 px-3">
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

        {/* Messages Inbox */}
        {activeMenu === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="col-span-1 bg-white rounded-xl shadow p-0 overflow-hidden border">
              <div className="bg-[#FFD700] px-4 py-3 font-bold text-[#1a233b] border-b">Inbox</div>
              <ul className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
                {messages.length === 0 && (
                  <li className="p-6 text-center text-gray-400">No messages</li>
                )}
                {messages.map(msg => (
                  <li key={msg.id || msg.uuid || msg.message_id} className={`p-4 cursor-pointer transition bg-white hover:bg-[#FFFBEA] ${!msg.is_read ? 'font-semibold bg-[#FFFBEA]' : ''} ${selectedMessage && (selectedMessage.id === msg.id || selectedMessage.uuid === msg.uuid || selectedMessage.message_id === msg.message_id) ? 'ring-2 ring-[#FFD700]' : ''}`}
                    onClick={() => setSelectedMessage(msg)}>
                    <div className="flex justify-between items-center">
                      <span>{msg.name}{msg.email && <span className="ml-2 text-xs text-gray-500">({msg.email})</span>}</span>
                      <div className="flex items-center gap-2">
                        {msg.type === 'review' && msg.rating && (
                          <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                            ⭐ {msg.rating}/5
                          </span>
                        )}
                        {msg.replied_at && <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Replied</span>}
                        {!msg.is_read && <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">Unread</span>}
                      </div>
                    </div>
                    <div className="truncate text-gray-700 mt-1">
                      {msg.type === 'review' ? (
                        <span className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">Review:</span>
                          <span>{msg.booking_id ? `Booking #${msg.booking_id}` : msg.title}</span>
                        </span>
                      ) : (
                        msg.subject || msg.title || <span className="italic text-gray-400">No subject</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Message Detail */}
            <div className="col-span-2 bg-white rounded-xl shadow p-8 min-h-[40vh] flex flex-col">
              {!selectedMessage ? (
                <div className="text-gray-400 text-center my-auto">Select a message to read</div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-lg font-bold text-[#1a233b]">
                        {selectedMessage.type === 'review' ? (
                          <div className="flex items-center gap-3">
                            <span>Customer Review</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`text-lg ${star <= selectedMessage.rating ? 'text-yellow-400' : 'text-gray-300'}`}>⭐</span>
                              ))}
                              <span className="ml-1 text-sm text-gray-600">({selectedMessage.rating}/5)</span>
                            </div>
                          </div>
                        ) : (
                          selectedMessage.subject || selectedMessage.title || <span className="italic text-gray-400">No subject</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">From: {selectedMessage.name}{selectedMessage.email && ` <${selectedMessage.email}>`}</div>
                      {selectedMessage.booking_id && (
                        <div className="text-sm text-blue-600 font-medium">Booking: #{selectedMessage.booking_id} ({selectedMessage.booking_type} - {selectedMessage.item_name})</div>
                      )}
                      <div className="text-xs text-gray-400">{new Date(selectedMessage.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      {selectedMessage.email && (
                        <Button size="sm" variant="outline" onClick={handleReplyMessage} className="bg-blue-100 text-blue-700 hover:bg-blue-200">Reply</Button>
                      )}
                      {!selectedMessage.is_read ? (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(selectedMessage.id)} className="bg-green-100 text-green-700 hover:bg-green-200">Mark as Read</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsUnread(selectedMessage.id)} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Mark as Unread</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteMessage(selectedMessage.id)} className="bg-red-100 text-red-700 hover:bg-red-200">Delete</Button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800 text-base border-t pt-4">{selectedMessage.message}</div>
                  {selectedMessage.replied_at && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-700 font-medium">✓ Replied on {new Date(selectedMessage.replied_at).toLocaleString()}</div>
                    </div>
                  )}
                </>
              )}
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
        </Dialog>)

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
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('BUTTON CLICKED - qrCode:', qrCode);
                          console.log('BUTTON CLICKED - isValidating:', isValidating);
                          handleValidateTicket();
                        }}
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
                    
                    {/* Test Button for the ticket from the image */}
                    <div className="mt-3 pt-3 border-t border-emerald-100 space-y-2">
                      <p className="text-xs text-emerald-600 font-medium mb-2">Test Validation:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('TEST BUTTON CLICKED - Setting qrCode to TKT-1757889231-001');
                            setQrCode('TKT-1757889231-001');
                            setTimeout(() => {
                              console.log('Calling handleValidateTicket with TKT-1757889231-001');
                              handleValidateTicket('TKT-1757889231-001');
                            }, 100);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full"
                          type="button"
                        >
                          Test: TKT-1757889231-001
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('TEST BUTTON 2 CLICKED - Setting qrCode to TKT-1757889232-002');
                            setQrCode('TKT-1757889232-002');
                            setTimeout(() => {
                              console.log('Calling handleValidateTicket with TKT-1757889232-002');
                              handleValidateTicket('TKT-1757889232-002');
                            }, 100);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full"
                          type="button"
                        >
                          Test: TKT-1757889232-002
                        </Button>
                      </div>
                    </div>
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
                            console.error('QR Scanner error:', error);
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

            {/* Debug Section */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Debug Information</h3>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug/tickets')
                    const data = await response.json()
                    console.log('Debug data:', data)
                    toast.success('Debug data logged to console')
                  } catch (error) {
                    toast.error('Debug failed')
                  }
                }}
                variant="outline"
                className="mb-4"
              >
                Check Database Tables
              </Button>
              <div className="text-sm text-gray-600">
                <p>Click the button above to check if tickets and individual_tickets are being created properly.</p>
                <p>Check the browser console for detailed information.</p>
              </div>
            </div>
          </div>
        )}
      </main>

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
                    className="bg-[#C49B66] hover:bg-[#b8905c] text-white"
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Ticket Create/Edit Dialog */}
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Spa Day Experience"
                  />
                </div>
                <div>
                  <Label htmlFor="activity_type">Activity Type *</Label>
                  <Input
                    id="activity_type"
                    value={ticketForm.activity_type}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    placeholder="e.g., Wellness, Adventure, Cultural"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the activity or experience..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={ticketForm.event_date}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event_time">Event Time *</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={ticketForm.event_time}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, event_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    step="0.5"
                    value={ticketForm.duration_hours}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, duration_hours: e.target.value }))}
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (GHC) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <Label htmlFor="total_quantity">Total Quantity *</Label>
                  <Input
                    id="total_quantity"
                    type="number"
                    value={ticketForm.total_quantity}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, total_quantity: e.target.value }))}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={ticketForm.venue}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="e.g., Hotel Spa, Conference Room A"
                />
              </div>

              <div>
                <Label htmlFor="image_upload">Upload Image</Label>
                <div className="space-y-3">
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
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={ticketForm.status}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTicketDialogOpen(false);
                    setIsEditingTicket(false);
                    setCurrentTicket(null);
                    setImageFile(null);
                    setImagePreview('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={isEditingTicket ? handleUpdateTicket : handleCreateTicket}
                  disabled={isCreatingTicket || isUpdatingTicket}
                  className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTicket ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a233b]"></div>
                      Creating...
                    </div>
                  ) : isUpdatingTicket ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a233b]"></div>
                      Updating...
                    </div>
                  ) : isEditingTicket ? 'Update Ticket' : 'Create Ticket'}
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