'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, ClockIcon, MapPinIcon, TicketIcon, UserIcon, PhoneIcon, MailIcon } from 'lucide-react';

interface TicketData {
  id: string;
  ticket_number: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  price: number;
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  qr_code: string;
  status: string;
  created_at: string;
  image_url?: string;
}

export default function TicketAccessPage() {
  const params = useParams();
  const shortHash = params.shortHash as string;
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortHash) {
      loadTicketData();
    }
  }, [shortHash]);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ticket-access/${shortHash}`);
      const data = await response.json();

      if (data.success && data.ticket) {
        setTicket(data.ticket);
      } else {
        setError(data.error || 'Ticket not found');
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError('Failed to load ticket information');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hotel 734 - Ticket</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .ticket { background: white; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a233b, #2a3441); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .qr-section { text-align: center; margin: 20px 0; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .detail-item { padding: 10px; background: #f8f9fa; border-radius: 6px; }
          .label { font-weight: bold; color: #1a233b; }
          .value { color: #666; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1 style="margin: 0; color: #FFD700;">HOTEL 734</h1>
            <p style="margin: 5px 0 0 0;">Event Ticket</p>
          </div>
          <div class="content">
            <h2 style="color: #1a233b; margin-top: 0;">${ticket.event_name}</h2>
            <div class="details">
              <div class="detail-item">
                <div class="label">Date</div>
                <div class="value">${new Date(ticket.event_date).toLocaleDateString()}</div>
              </div>
              <div class="detail-item">
                <div class="label">Time</div>
                <div class="value">${ticket.event_time}</div>
              </div>
              <div class="detail-item">
                <div class="label">Venue</div>
                <div class="value">${ticket.venue}</div>
              </div>
              <div class="detail-item">
                <div class="label">Ticket Number</div>
                <div class="value">${ticket.ticket_number}</div>
              </div>
              <div class="detail-item">
                <div class="label">Customer</div>
                <div class="value">${ticket.customer_name}</div>
              </div>
              <div class="detail-item">
                <div class="label">Quantity</div>
                <div class="value">${ticket.quantity} ticket(s)</div>
              </div>
            </div>
            <div class="qr-section">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qr_code)}" alt="QR Code" style="margin: 0 auto; display: block;">
              <p style="margin-top: 10px;"><strong>QR Code:</strong> ${ticket.qr_code}</p>
              <p style="font-size: 12px; color: #666;">Present this ticket at the venue for entry</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hotel734-Ticket-${ticket.ticket_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
            <p>{error}</p>
          </div>
          <p className="text-white">
            If you believe this is an error, please contact Hotel 734 support.
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">No ticket data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#FFD700] rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-[#C49B66] rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-[#FFD700] rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#C49B66] to-[#FFD700] mb-2">
            HOTEL 734
          </h1>
          <p className="text-white text-lg">Your Event Ticket</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-[#1a233b] to-[#2a3441] p-6 text-center border-b-4 border-[#FFD700]">
            <h2 className="text-2xl font-bold text-white mb-2">{ticket.event_name}</h2>
            <div className="flex items-center justify-center space-x-4 text-[#FFD700]">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{new Date(ticket.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>{ticket.event_time}</span>
              </div>
            </div>
          </div>

          {/* Event Image */}
          {ticket.image_url && (
            <div className="relative h-48 bg-gray-200">
              <Image
                src={ticket.image_url}
                alt={ticket.event_name}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Ticket Details */}
          <div className="p-6 space-y-6">
            {/* Venue */}
            <div className="flex items-center text-white">
              <MapPinIcon className="w-6 h-6 text-[#FFD700] mr-3" />
              <div>
                <p className="text-sm text-gray-300">Venue</p>
                <p className="text-lg font-semibold">{ticket.venue}</p>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-white">
                <TicketIcon className="w-6 h-6 text-[#FFD700] mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Ticket Number</p>
                  <p className="text-lg font-mono">{ticket.ticket_number}</p>
                </div>
              </div>

              <div className="flex items-center text-white">
                <UserIcon className="w-6 h-6 text-[#FFD700] mr-3" />
                <div>
                  <p className="text-sm text-gray-300">Quantity</p>
                  <p className="text-lg font-semibold">{ticket.quantity} ticket(s)</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-[#FFD700] mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-white">
                  <UserIcon className="w-5 h-5 text-[#FFD700] mr-3" />
                  <span>{ticket.customer_name}</span>
                </div>
                {ticket.customer_email && (
                  <div className="flex items-center text-white">
                    <MailIcon className="w-5 h-5 text-[#FFD700] mr-3" />
                    <span>{ticket.customer_email}</span>
                  </div>
                )}
                {ticket.customer_phone && (
                  <div className="flex items-center text-white">
                    <PhoneIcon className="w-5 h-5 text-[#FFD700] mr-3" />
                    <span>{ticket.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="border-t border-white/20 pt-6 text-center">
              <h3 className="text-lg font-semibold text-[#FFD700] mb-4">Entry QR Code</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
                {/* QR Code Image */}
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_code)}`}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                {/* QR Code Text */}
                <p className="text-lg font-mono text-white font-bold">{ticket.qr_code}</p>
              </div>
              <p className="text-sm text-gray-300 mt-2">Present this QR code at the venue for entry</p>
            </div>

            {/* Status */}
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                ticket.status === 'used' ? 'bg-gray-500/20 text-gray-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {ticket.status.toUpperCase()}
              </span>
            </div>

            {/* Download Button */}
            <div className="text-center pt-4">
              <button
                onClick={downloadTicket}
                className="bg-gradient-to-r from-[#FFD700] to-[#C49B66] text-[#1a233b] px-8 py-3 rounded-lg font-semibold hover:scale-105 transform transition-all duration-200 shadow-lg"
              >
                Download Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Thank you for choosing Hotel 734</p>
          <p className="text-sm">For support, contact us at info@hotel734.com</p>
        </div>
      </div>
    </div>
  );
}
