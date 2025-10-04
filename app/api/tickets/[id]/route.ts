import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log('🎫 Fetching ticket details for ID:', id);

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Ticket fetch error:', error);
      return NextResponse.json({
        error: 'Ticket not found',
        details: error.message
      }, { status: 404 });
    }

    console.log('✅ Ticket details fetched:', data?.id);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Ticket API error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch ticket details',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    console.log('🔄 Updating ticket with ID:', id, 'Data:', updateData);

    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Ticket update error:', error);
      return NextResponse.json({
        error: 'Failed to update ticket',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Ticket updated successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      data
    });

  } catch (error: any) {
    console.error('❌ Ticket update API error:', error);
    
    return NextResponse.json({
      error: 'Failed to update ticket',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log('🗑️ Deleting ticket with ID:', id);

    // First, check if tickets table exists by trying a simple query
    const { data: ticketCheck, error: ticketCheckError } = await supabase
      .from('tickets')
      .select('id, status')
      .eq('id', id)
      .single();

    if (ticketCheckError) {
      console.error('❌ Error checking ticket:', ticketCheckError);
      
      // If table doesn't exist, return success (nothing to delete)
      if (ticketCheckError.code === 'PGRST116' || ticketCheckError.message?.includes('relation "tickets" does not exist')) {
        console.log('⚠️ Tickets table does not exist, returning success');
        return NextResponse.json({
          success: true,
          message: 'Ticket deleted successfully (table does not exist)',
          data: { id }
        });
      }
      
      return NextResponse.json({
        error: 'Failed to check ticket',
        details: ticketCheckError.message
      }, { status: 500 });
    }

    if (!ticketCheck) {
      return NextResponse.json({
        error: 'Ticket not found',
        details: 'No ticket found with the specified ID'
      }, { status: 404 });
    }

    // Check if there are any references to this ticket that would prevent deletion
    let hasReferences = false;
    let referenceReason = '';
    
    console.log('🔍 Starting reference checks for ticket:', id);
    
    // Check ticket_purchases table
    try {
      const { data: purchases, error: purchaseError } = await supabase
        .from('ticket_purchases')
        .select('id')
        .eq('ticket_id', id)
        .limit(1);

      if (!purchaseError && purchases && purchases.length > 0) {
        hasReferences = true;
        referenceReason = 'ticket purchases';
        console.log('⚠️ Ticket has existing purchases, will soft delete');
      }
    } catch (purchaseCheckError) {
      console.log('⚠️ Could not check purchases table:', purchaseCheckError);
    }
    
    // Check payments table (always check, regardless of purchases)
    if (!hasReferences) {
      console.log('🔍 Checking payments table for ticket:', id);
      try {
        // First, let's try to get the schema of the payments table
        const { data: schemaCheck, error: schemaError } = await supabase
          .from('payments')
          .select('*')
          .limit(5);
        
        console.log('📊 Payments table schema sample:', { schemaCheck, schemaError });
        
        // Also get a count of all payments to see if table has data
        const { count, error: countError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true });
        
        console.log('📊 Payments table total count:', { count, countError });
        
        // Try different possible column names for ticket reference
        let payments = null;
        let paymentError = null;
        
        // Try ticket_id with exact match first
        const { data: paymentsById, error: errorById } = await supabase
          .from('payments')
          .select('*')
          .eq('ticket_id', id);
        
        console.log('🔍 ticket_id exact match result:', { paymentsById, errorById });
        
        if (!errorById && paymentsById && paymentsById.length > 0) {
          payments = paymentsById;
          console.log('✅ Found payments using ticket_id column (exact match)');
        } else {
          // Try ticket_id as string (in case of type mismatch)
          const { data: paymentsByIdString, error: errorByIdString } = await supabase
            .from('payments')
            .select('*')
            .eq('ticket_id', String(id));
          
          console.log('🔍 ticket_id string match result:', { paymentsByIdString, errorByIdString });
          
          if (!errorByIdString && paymentsByIdString && paymentsByIdString.length > 0) {
            payments = paymentsByIdString;
            console.log('✅ Found payments using ticket_id column (string match)');
          } else {
            // Try ticketId (camelCase)
            const { data: paymentsByTicketId, error: errorByTicketId } = await supabase
              .from('payments')
              .select('*')
              .eq('ticketId', id);
            
            if (!errorByTicketId && paymentsByTicketId && paymentsByTicketId.length > 0) {
              payments = paymentsByTicketId;
              console.log('✅ Found payments using ticketId column');
            } else {
              // Try id (if payments table references tickets by id)
              const { data: paymentsById2, error: errorById2 } = await supabase
                .from('payments')
                .select('*')
                .eq('id', id);
              
              if (!errorById2 && paymentsById2 && paymentsById2.length > 0) {
                payments = paymentsById2;
                console.log('✅ Found payments using id column');
              } else {
                paymentError = errorById || errorByTicketId || errorById2;
                console.log('❌ No payments found with any column name');
              }
            }
          }
        }

        console.log('📊 Final payments query result:', { payments, error: paymentError });

        if (paymentError) {
          console.error('❌ Payment query error:', paymentError);
        } else if (payments && payments.length > 0) {
          hasReferences = true;
          referenceReason = 'payments';
          console.log('⚠️ Ticket has existing payments, will soft delete. Count:', payments.length);
        } else {
          console.log('✅ No payments found for ticket:', id);
        }
      } catch (paymentCheckError) {
        console.log('⚠️ Could not check payments table:', paymentCheckError);
      }
    } else {
      console.log('✅ Already found references, skipping payments check');
    }

    console.log('📊 Final decision - hasReferences:', hasReferences, 'reason:', referenceReason);
    
    if (hasReferences) {
      console.log('🔄 Performing SOFT DELETE due to references');
      // Soft delete - mark as inactive instead of hard delete
      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Ticket soft delete error:', error);
        return NextResponse.json({
          error: 'Failed to deactivate ticket',
          details: error.message
        }, { status: 500 });
      }

      console.log('✅ Ticket deactivated successfully:', data?.id);

      return NextResponse.json({
        success: true,
        message: `Ticket deactivated successfully (has existing ${referenceReason})`,
        data
      });
    } else {
      console.log('☠️ Performing HARD DELETE (no references found)');
      // Hard delete if no purchases exist
      const { data, error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Ticket delete error:', error);
        
        // If we get a foreign key constraint error even though no records exist,
        // fall back to soft delete to work around the constraint
        if (error.code === '23503' && error.message?.includes('foreign key constraint')) {
          console.log('⚠️ Foreign key constraint detected, falling back to soft delete');
          
          const { data: softData, error: softError } = await supabase
            .from('tickets')
            .update({
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
          
          if (softError) {
            console.error('❌ Soft delete fallback failed:', softError);
            return NextResponse.json({
              error: 'Failed to delete ticket',
              details: softError.message
            }, { status: 500 });
          }
          
          console.log('✅ Ticket soft deleted successfully (constraint workaround):', softData?.id);
          
          return NextResponse.json({
            success: true,
            message: 'Ticket deactivated successfully (foreign key constraint workaround)',
            data: softData
          });
        }
        
        return NextResponse.json({
          error: 'Failed to delete ticket',
          details: error.message
        }, { status: 500 });
      }

      console.log('✅ Ticket deleted successfully:', data?.id);

      return NextResponse.json({
        success: true,
        message: 'Ticket deleted successfully',
        data
      });
    }

  } catch (error: any) {
    console.error('❌ Ticket delete API error:', error);
    
    return NextResponse.json({
      error: 'Failed to delete ticket',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}
