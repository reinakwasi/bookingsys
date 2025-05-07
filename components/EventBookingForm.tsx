'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { bookingsAPI } from '@/lib/api';

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  startDate: z.string().min(1, 'Event date is required'),
  numberOfGuests: z.number().min(1, 'Number of guests is required'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface EventBookingFormProps {
  eventId: string;
  eventType: string;
  price: number;
  capacity: number;
  onSuccess?: () => void;
}

export default function EventBookingForm({
  eventId,
  eventType,
  price,
  capacity,
  onSuccess,
}: EventBookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfGuests: 1,
    },
  });

  const numberOfGuests = watch('numberOfGuests');

  const calculateTotalPrice = () => {
    return price * (numberOfGuests || 1);
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsLoading(true);
      await bookingsAPI.create({
        ...data,
        bookingType: 'event',
        itemId: eventId,
        totalPrice: calculateTotalPrice(),
        endDate: data.startDate, // For events, end date is same as start date
      });
      toast.success('Event booking request submitted successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit event booking request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book {eventType} Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                {...register('guestName')}
                disabled={isLoading}
              />
              {errors.guestName && (
                <p className="text-sm text-red-500">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="1"
                max={capacity}
                {...register('numberOfGuests', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.numberOfGuests && (
                <p className="text-sm text-red-500">{errors.numberOfGuests.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Maximum capacity: {capacity} guests
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Event Date</Label>
              <Input
                id="startDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('startDate')}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <Input
              id="specialRequests"
              {...register('specialRequests')}
              disabled={isLoading}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total Price:</span>
              <span className="text-xl font-bold">${calculateTotalPrice()}</span>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Book Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 