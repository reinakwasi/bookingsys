'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, User, Mail, Download, Share2, QrCode, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface IndividualTicket {
  id: string
  ticket_number: string
  qr_code: string
  holder_name: string
  holder_email: string
  status: 'unused' | 'used' | 'expired' | 'transferred'
  used_at?: string
  used_by?: string
  ticket_purchases: {
    tickets: {
      id: string
      name: string
      description: string
      event_date: string
      event_time: string
      venue: string
      image_url: string
    }
  }
}

export default function SingleTicketPage() {
  const params = useParams()
  const ticketId = params.id as string
  const [ticket, setTicket] = useState<IndividualTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/individual/${ticketId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ticket')
      }
      const data = await response.json()
      setTicket(data)
    } catch (err) {
      setError('Failed to load ticket. Please check your link.')
      console.error('Error fetching ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = () => {
    if (!ticket) return
    
    const ticketData = {
      ticketNumber: ticket.ticket_number,
      eventName: ticket.ticket_purchases.tickets.name,
      eventDate: ticket.ticket_purchases.tickets.event_date,
      eventTime: ticket.ticket_purchases.tickets.event_time,
      venue: ticket.ticket_purchases.tickets.venue,
      holderName: ticket.holder_name,
      qrCode: ticket.qr_code
    }
    
    const content = `
HOTEL 734 EVENT TICKET
======================

Ticket Number: ${ticketData.ticketNumber}
Event: ${ticketData.eventName}
Date: ${ticketData.eventDate}
Time: ${ticketData.eventTime}
Venue: ${ticketData.venue}
Holder: ${ticketData.holderName}
QR Code: ${ticketData.qrCode}

Please present this ticket at the venue for entry.
Status: ${ticket.status.toUpperCase()}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${ticketData.ticketNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Ticket downloaded successfully!')
  }

  const shareTicket = async () => {
    if (!ticket) return
    
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticket.ticket_purchases.tickets.name} - Ticket`,
          text: `Here's your ticket for ${ticket.ticket_purchases.tickets.name}`,
          url: shareUrl
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Ticket link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/tickets'}>
              Browse Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const event = ticket.ticket_purchases.tickets

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Event Ticket</h1>
            <p className="text-gray-600">Hotel 734</p>
          </div>
        </div>

        {/* Ticket Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            {/* Event Image */}
            {event.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold">{event.name}</h2>
                </div>
              </div>
            )}

            <CardContent className="p-8">
              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Event Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium">{new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      <p className="font-medium">{event.event_time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Ticket Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Number</p>
                      <p className="font-mono font-bold text-lg">{ticket.ticket_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Holder Name</p>
                      <p className="font-medium">{ticket.holder_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge 
                        variant={ticket.status === 'unused' ? 'default' : 
                                ticket.status === 'used' ? 'secondary' : 'destructive'}
                        className="mt-1"
                      >
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center mb-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Entry QR Code</h3>
                <div className="inline-block bg-white p-6 rounded-xl border-4 border-emerald-200 shadow-lg">
                  <QrCode className="h-32 w-32 text-emerald-600 mx-auto mb-4" />
                  <p className="font-mono text-xs text-gray-600 break-all max-w-xs">
                    {ticket.qr_code}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Present this QR code at the venue entrance
                </p>
              </div>

              {/* Usage Information */}
              {ticket.used_at && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Usage Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Used on:</span> {new Date(ticket.used_at).toLocaleString()}</p>
                    <p><span className="font-medium">Validated by:</span> {ticket.used_by}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={downloadTicket}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>
                <Button 
                  onClick={shareTicket}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Ticket
                </Button>
              </div>

              {/* Important Notes */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This ticket is valid for one person only</li>
                  <li>• Please arrive at least 15 minutes before the event</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Screenshots of QR codes are acceptable</li>
                  <li>• Contact Hotel 734 for any issues or questions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
