"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { eventsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    eventsAPI.getById(eventId)
      .then(setEvent)
      .catch(() => toast.error("Event not found"))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleBookEvent = async () => {
    setPurchasing(true);
    try {
      router.push(`/booking?type=event&id=${eventId}`);
      setSuccess(true);
      setShowModal(false);
      toast.success("Redirecting to event booking...");
    } catch (e: any) {
      toast.error("Failed to redirect to booking");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!event) return <div className="p-8 text-center text-red-500">Event not found.</div>;

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{event.name}</CardTitle>
          <div className="mt-2 text-muted-foreground">{event.type}</div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Description:</strong>
            <p>{event.description}</p>
          </div>
          <div className="mb-2">
            <strong>Date:</strong> {event.date ? new Date(event.date).toLocaleDateString() : "TBA"}
          </div>
          <div className="mb-2">
            <strong>Price:</strong> {event.price} GHS
          </div>
          <div className="mb-2">
            <strong>Capacity:</strong> {event.capacity}
          </div>
          <Button onClick={() => setShowModal(true)} className="mt-6 w-full text-lg font-semibold">
            Book Event
          </Button>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Book Event</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Number of Guests</label>
              <Input
                type="number"
                min={1}
                max={event.capacity}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleBookEvent} disabled={purchasing} className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2 text-green-600">Booking Successful!</h2>
            <p className="mb-4">You will be redirected to complete your event booking details.</p>
            <Button onClick={() => setSuccess(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 