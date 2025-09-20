import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, rating, reviewText, guestName, email, bookingDetails } = await request.json();

    console.log('📝 Submitting review:', {
      bookingId,
      rating,
      guestName,
      reviewLength: reviewText?.length
    });

    // Create the review/message record for admin
    const reviewData = {
      booking_id: bookingId,
      guest_name: guestName,
      email: email || null,
      rating: parseInt(rating),
      review_text: reviewText,
      booking_type: bookingDetails?.booking_type || 'unknown',
      item_name: bookingDetails?.item_id || 'Unknown',
      created_at: new Date().toISOString(),
      status: 'unread'
    };

    // Insert into reviews table (we'll create this table)
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error('❌ Review submission error:', error);
      
      // If reviews table doesn't exist, create a fallback message
      if (error.code === '42P01') { // Table doesn't exist
        console.log('📋 Reviews table not found, creating admin message instead...');
        
        // Create admin message as fallback
        const messageData = {
          type: 'review',
          title: `New Review - ${rating} Stars`,
          message: `Guest: ${guestName}\nBooking: #${bookingId}\nRating: ${rating}/5 stars\n\nReview:\n${reviewText}`,
          metadata: JSON.stringify({
            bookingId,
            rating,
            guestName,
            email,
            bookingType: bookingDetails?.booking_type
          }),
          created_at: new Date().toISOString(),
          status: 'unread'
        };

        const { data: messageResult, error: messageError } = await supabase
          .from('admin_messages')
          .insert(messageData)
          .select()
          .single();

        if (messageError) {
          console.error('❌ Admin message creation error:', messageError);
          throw new Error('Failed to save review');
        }

        console.log('✅ Review saved as admin message:', messageResult.id);
        return NextResponse.json({
          success: true,
          id: messageResult.id,
          message: 'Review submitted successfully'
        });
      }
      
      throw error;
    }

    console.log('✅ Review submitted successfully:', data.id);

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Review submitted successfully'
    });

  } catch (error: any) {
    console.error('❌ Review submission error:', error);
    
    return NextResponse.json({
      error: 'Failed to submit review',
      details: error.message
    }, { status: 500 });
  }
}
