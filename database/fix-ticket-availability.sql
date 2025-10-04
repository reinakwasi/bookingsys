-- Fix existing tickets that have NULL or 0 available_quantity
-- This script will set available_quantity to total_quantity for tickets that should be available

-- First, let's see what tickets have issues
SELECT 
    id,
    title,
    total_quantity,
    available_quantity,
    status,
    created_at
FROM tickets 
WHERE available_quantity IS NULL 
   OR (available_quantity = 0 AND status = 'active')
ORDER BY created_at DESC;

-- Fix tickets that have NULL available_quantity
UPDATE tickets 
SET available_quantity = total_quantity,
    status = 'active',
    updated_at = NOW()
WHERE available_quantity IS NULL;

-- Fix tickets that have 0 available_quantity but are marked as active
-- (These might be incorrectly marked as sold out)
UPDATE tickets 
SET available_quantity = total_quantity,
    updated_at = NOW()
WHERE available_quantity = 0 
  AND status = 'active'
  AND total_quantity > 0;

-- Verify the fixes
SELECT 
    id,
    title,
    total_quantity,
    available_quantity,
    status,
    updated_at
FROM tickets 
WHERE status = 'active'
ORDER BY created_at DESC;
