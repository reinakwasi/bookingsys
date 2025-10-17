"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Mail, Users, Send, Trash2, Plus, Upload, X, Image as ImageIcon } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  subscribed_at: string
  unsubscribed_at?: string
}

interface NewsletterStats {
  total: number
  active: number
  unsubscribed: number
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<NewsletterStats>({ total: 0, active: 0, unsubscribed: 0 })
  const [loading, setLoading] = useState(true)
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    content: ''
  })
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, file: File}>>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/newsletter/subscribers')
      const data = await response.json()
      
      if (response.ok) {
        setSubscribers(data.subscribers)
        setStats(data.stats)
      } else {
        console.error('Failed to load subscribers:', data.error)
        toast.error('Failed to load subscribers')
      }
    } catch (error) {
      console.error('Error loading subscribers:', error)
      toast.error('Error loading subscribers')
    } finally {
      setLoading(false)
    }
  }

  const deleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber: ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/newsletter/subscribers?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Subscriber deleted successfully')
        loadSubscribers() // Reload the list
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete subscriber')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast.error('Error deleting subscriber')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('❌ Please select an image file', {
        style: {
          background: 'linear-gradient(to right, #EF4444, #DC2626)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('📏 Image size must be less than 5MB', {
        style: {
          background: 'linear-gradient(to right, #EF4444, #DC2626)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      })
      return
    }

    setIsUploadingImage(true)
    try {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file)
      const imageId = Date.now().toString()
      
      setUploadedImages(prev => [...prev, {
        id: imageId,
        url: imageUrl,
        file: file
      }])

      toast.success('📸 Image added to newsletter', {
        style: {
          background: 'linear-gradient(to right, #10B981, #059669)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url) // Clean up memory
      }
      return prev.filter(img => img.id !== imageId)
    })
  }

  const handleSendClick = () => {
    if (!newsletterForm.subject.trim() || !newsletterForm.content.trim()) {
      toast.error('Please fill in both subject and content')
      return
    }

    if (stats.active === 0) {
      toast.error('No active subscribers to send to')
      return
    }

    setShowConfirmDialog(true)
  }

  const sendNewsletter = async () => {
    setShowConfirmDialog(false)

    try {
      setSendingNewsletter(true)
      
      // Convert images to base64 for email embedding
      const imageData = await Promise.all(
        uploadedImages.map(async (img) => {
          return new Promise<{id: string, base64: string, type: string}>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                id: img.id,
                base64: reader.result as string,
                type: img.file.type
              })
            }
            reader.readAsDataURL(img.file)
          })
        })
      )

      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newsletterForm.subject,
          content: newsletterForm.content,
          images: imageData
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`📧 Newsletter sent successfully! ${data.stats.sent} sent, ${data.stats.failed} failed`, {
          style: {
            background: 'linear-gradient(to right, #3B82F6, #1D4ED8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500'
          },
          duration: 6000
        })
        setShowSendDialog(false)
        setNewsletterForm({ subject: '', content: '' })
        setUploadedImages([])
      } else {
        toast.error(data.error || 'Failed to send newsletter')
      }
    } catch (error) {
      console.error('Error sending newsletter:', error)
      toast.error('Error sending newsletter')
    } finally {
      setSendingNewsletter(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">×</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unsubscribed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Newsletter Subscribers</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSendDialog(true)}
            disabled={stats.active === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Newsletter
          </Button>
          <Button
            onClick={loadSubscribers}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => deleteSubscriber(subscriber.email)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Newsletter Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Compose Newsletter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">
                Subject Line
              </Label>
              <Input
                id="subject"
                value={newsletterForm.subject}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter newsletter subject..."
                className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Newsletter Images
              </Label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="newsletter-image-upload"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="newsletter-image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    {isUploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : (
                      <Upload className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isUploadingImage ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Newsletter image"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                Newsletter Content
              </Label>
              <Textarea
                id="content"
                value={newsletterForm.content}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your newsletter content here..."
                rows={12}
                className="text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500">
                Tip: Use line breaks to separate paragraphs. Images will be embedded in the email.
              </p>
            </div>

            {/* Info Alert */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Ready to Send</h4>
                  <p className="text-sm text-blue-800">
                    This newsletter will be sent to <span className="font-bold">{stats.active}</span> active subscribers.
                    {uploadedImages.length > 0 && (
                      <span className="block mt-1">
                        📸 {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} will be included.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowSendDialog(false)
                  setNewsletterForm({ subject: '', content: '' })
                  setUploadedImages([])
                }}
                variant="outline"
                disabled={sendingNewsletter}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendClick}
                disabled={sendingNewsletter || !newsletterForm.subject.trim() || !newsletterForm.content.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
              >
                {sendingNewsletter ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Newsletter...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {stats.active} Subscribers
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            {/* Hotel 734 Logo/Icon */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Send Newsletter
            </h3>
            
            {/* Message */}
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to send this newsletter?
              </p>
              
              {/* Newsletter Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Subject:</span>
                    <span className="text-gray-900 font-semibold truncate ml-2 max-w-48">
                      {newsletterForm.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Recipients:</span>
                    <span className="text-blue-600 font-bold">{stats.active} subscribers</span>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Images:</span>
                      <span className="text-purple-600 font-semibold">
                        {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                This action cannot be undone. The newsletter will be sent immediately.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={sendNewsletter}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
