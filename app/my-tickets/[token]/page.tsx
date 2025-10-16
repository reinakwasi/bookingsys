'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Mail, Phone, Ticket, Download, Share2, QrCode } from "lucide-react"
import { toast } from "sonner"
import QRCodeGenerator from "@/components/QRCodeGenerator"

interface Ticket {
  id: string
  name: string
  description: string
  event_date: string
  event_time: string
  price: number
  venue: string
  image_url: string
  activity_type: string
}

interface IndividualTicket {
  id: string
  ticket_number: string
  qr_code: string
  holder_name: string
  holder_email: string
  status: 'unused' | 'used' | 'expired' | 'transferred'
  used_at?: string
  used_by?: string
}

interface TicketPurchase {
  id: string
  ticket: Ticket
  customer_name: string
  customer_email: string
  customer_phone: string
  quantity: number
  total_amount: number
  payment_status: string
  purchase_date: string
  individual_tickets: IndividualTicket[]
}

export default function MyTicketsPage() {
  const params = useParams()
  const token = params.token as string
  const [purchase, setPurchase] = useState<TicketPurchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [token])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/purchase/${token}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }
      const data = await response.json()
      setPurchase(data)
    } catch (err) {
      setError('Failed to load your tickets. Please check your link.')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = async (individualTicket: IndividualTicket) => {
    // Create a professional HTML ticket for download
    const ticketData = {
      ticketNumber: individualTicket.ticket_number,
      eventName: purchase?.ticket.name,
      eventDate: purchase?.ticket.event_date,
      eventTime: purchase?.ticket.event_time,
      venue: purchase?.ticket.venue,
      holderName: individualTicket.holder_name,
      qrCode: individualTicket.qr_code,
      price: purchase?.total_amount ? (purchase.total_amount / purchase.quantity) : 0
    }
    
    // Generate QR code as data URL first
    let qrCodeDataURL = '';
    try {
      const QRCode = (await import('qrcode')).default;
      qrCodeDataURL = await QRCode.toDataURL(individualTicket.qr_code, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code generated successfully as data URL');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
    
    // Create a new window with the ticket design
    const ticketWindow = window.open('', '_blank', 'width=800,height=600')
    if (!ticketWindow) {
      toast.error('Please allow popups to download ticket')
      return
    }

    ticketWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hotel 734 - Event Ticket</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #10b981, #0d9488);
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ticket {
            background: white;
            width: 600px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
          }
          .ticket::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: repeating-linear-gradient(to bottom, #ddd 0px, #ddd 10px, transparent 10px, transparent 20px);
            transform: translateX(-50%);
          }
          .header {
            background: linear-gradient(135deg, #10b981, #0d9488);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          .header h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header p {
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            display: flex;
            min-height: 300px;
          }
          .left {
            flex: 1;
            padding: 30px;
          }
          .right {
            width: 200px;
            background: #f8fafc;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-left: 2px dashed #ddd;
          }
          .event-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .detail {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .detail-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            color: #10b981;
          }
          .ticket-number {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 20px;
            text-align: center;
          }
          .qr-container {
            text-align: center;
            margin-bottom: 20px;
          }
          #qrcode {
            border: 2px solid #ddd;
            border-radius: 8px;
            background: white;
          }
          .qr-fallback {
            width: 120px;
            height: 120px;
            background: #000;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            text-align: center;
            line-height: 1.2;
            margin: 0 auto;
          }
          .price {
            background: #fef3c7;
            color: #92400e;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          .footer {
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          @media print {
            body { background: white; padding: 0; }
            .ticket { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>HOTEL 734</h1>
            <p>Event Ticket</p>
          </div>
          <div class="content">
            <div class="left">
              <div class="event-title">${ticketData.eventName}</div>
              <div class="detail">
                <span class="detail-icon">📅</span>
                <span>${ticketData.eventDate ? new Date(ticketData.eventDate).toLocaleDateString() : 'TBD'}</span>
              </div>
              <div class="detail">
                <span class="detail-icon">🕐</span>
                <span>${ticketData.eventTime}</span>
              </div>
              <div class="detail">
                <span class="detail-icon">📍</span>
                <span>${ticketData.venue}</span>
              </div>
              <div class="detail">
                <span class="detail-icon">👤</span>
                <span>${ticketData.holderName}</span>
              </div>
              <div class="price">
                GHC ${ticketData.price.toFixed(2)}
              </div>
            </div>
            <div class="right">
              <div class="ticket-number">${ticketData.ticketNumber}</div>
              <div class="qr-container">
                ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" alt="QR Code" style="width: 120px; height: 120px; border: 2px solid #ddd; border-radius: 8px;">` : '<div class="qr-fallback">QR: ' + ticketData.qrCode + '</div>'}
                <small>Scan at venue</small>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Present this ticket at the venue for entry • Valid for one person only</p>
            <p>For support, contact Hotel 734 • Keep this ticket safe</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            console.log('Ticket window loaded with QR code image');
            setTimeout(() => {
              window.print();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `)
    
    ticketWindow.document.close()
    toast.success('Ticket opened for download/print!')
  }

  const shareTicket = async (individualTicket: IndividualTicket) => {
    const shareText = `🎫 Hotel 734 Event Ticket\n\n` +
      `Event: ${purchase?.ticket.name}\n` +
      `Date: ${new Date(purchase?.ticket.event_date || '').toLocaleDateString()}\n` +
      `Time: ${purchase?.ticket.event_time}\n` +
      `Venue: ${purchase?.ticket.venue}\n` +
      `Ticket #: ${individualTicket.ticket_number}\n\n` +
      `Present this ticket number or QR code at the venue entrance.`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${purchase?.ticket.name} - Hotel 734 Ticket`,
          text: shareText
        })
        toast.success('Ticket shared successfully!')
      } catch (err) {
        console.log('Error sharing:', err)
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success('Ticket details copied to clipboard!')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Ticket details copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        toast.error('Failed to copy ticket details')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Tickets Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/tickets'}>
              Browse Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-amber-600 rounded-full mb-4">
            <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Your Event Tickets</h1>
          <p className="text-gray-600 text-base sm:text-lg">Hotel 734 • {purchase.ticket.name}</p>
        </div>

        {/* Event Summary Card */}
        <Card className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 sm:p-6 text-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{purchase.ticket.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm sm:text-base">{new Date(purchase.ticket.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm sm:text-base">{purchase.ticket.event_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm sm:text-base">{purchase.ticket.venue}</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold">GHC {purchase.total_amount}</div>
                <div className="text-slate-700 text-sm sm:text-base">{purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                {purchase.ticket.image_url && (
                  <div className="w-full bg-gray-100 rounded-xl mb-4 shadow-lg overflow-hidden">
                    <img 
                      src={purchase.ticket.image_url} 
                      alt={purchase.ticket.name}
                      className="w-full h-auto object-cover rounded-xl"
                    />
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{purchase.ticket.description}</p>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Purchase Information</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium break-words">{purchase.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="break-all">{purchase.customer_email}</span>
                    </div>
                    {purchase.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span>{purchase.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Purchase Date:</span>
                  <span className="font-medium">{new Date(purchase.purchase_date).toLocaleDateString()}</span>
                </div>
                <Badge 
                  variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}
                  className="w-full justify-center py-2 text-xs sm:text-sm"
                >
                  Payment {purchase.payment_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Tickets */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Your Individual Tickets
          </h2>
          <div className="grid gap-4 sm:gap-6">
            {purchase.individual_tickets?.map((individualTicket, index) => (
              <Card key={individualTicket.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left Section - Ticket Details */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ticket #{index + 1}</h3>
                        <Badge 
                          variant={individualTicket.status === 'unused' ? 'default' : 
                                  individualTicket.status === 'used' ? 'secondary' : 'destructive'}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
                        >
                          {individualTicket.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4 sm:mb-6">
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <div className="text-xs sm:text-sm text-emerald-700 font-medium">Ticket Number</div>
                          <div className="text-base sm:text-lg font-bold text-emerald-900 break-all">{individualTicket.ticket_number}</div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="font-medium break-words">{individualTicket.holder_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="break-all">{individualTicket.holder_email}</span>
                          </div>
                        </div>
                        
                        {individualTicket.used_at && (
                          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                            Used on: {new Date(individualTicket.used_at).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button 
                          onClick={() => downloadTicket(individualTicket)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg text-sm sm:text-base h-10 sm:h-11"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Ticket
                        </Button>
                        <Button 
                          onClick={() => shareTicket(individualTicket)}
                          variant="outline"
                          className="flex-1 border-emerald-200 hover:bg-emerald-50 text-sm sm:text-base h-10 sm:h-11"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Right Section - QR Code */}
                    <div className="w-full lg:w-64 bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-200">
                      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-lg mb-3 sm:mb-4">
                        <QRCodeGenerator 
                          value={individualTicket.ticket_number}
                          size={typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 128}
                          className="rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center font-medium">
                        Present this QR code<br/>at the venue entrance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 p-4 sm:p-6 bg-white/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">Important Instructions</span>
          </div>
          <p className="text-gray-700 mb-1 text-sm sm:text-base">Present your QR code or ticket number at the venue for entry</p>
          <p className="text-xs sm:text-sm text-gray-600">For support or questions, contact Hotel 734 customer service</p>
        </div>
      </div>
    </div>
  )
}
