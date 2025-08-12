// Test script for venue booking payment simulation
const testVenueBookingPayment = () => {
  console.log('🏟️ Testing Venue Booking Payment Simulation...')
  
  // Check if PaySimulator component is loaded
  const payButtons = document.querySelectorAll('button')
  const paySimulatorButton = Array.from(payButtons).find(btn => 
    btn.textContent?.includes('Book & Pay Now') || 
    btn.textContent?.includes('Complete Booking Details')
  )
  
  console.log('💳 Payment buttons found:', payButtons.length)
  console.log('🎯 PaySimulator button:', paySimulatorButton?.textContent || 'Not found')
  
  if (paySimulatorButton) {
    if (paySimulatorButton.disabled) {
      console.log('⚠️ Payment button is disabled - need to complete booking details first')
      
      // Check what's missing
      const courtSelect = document.querySelector('[placeholder="Choose a court"]')
      const dateCalendar = document.querySelector('[role="button"][data-selected]')
      const timeSlots = document.querySelectorAll('button:contains("AM"), button:contains("PM")')
      
      console.log('📋 Booking form status:')
      console.log('  - Court selected:', courtSelect ? 'Yes' : 'No')
      console.log('  - Date selected:', dateCalendar ? 'Yes' : 'No') 
      console.log('  - Time slots available:', timeSlots.length)
      
      console.log('💡 To enable payment: Select a court, date, and time slots')
      
    } else {
      console.log('✅ Payment button is enabled and ready')
      console.log('🖱️ Click the payment button to test the simulation')
    }
  } else {
    console.log('❌ PaySimulator button not found on page')
  }
  
  // Check if required components are loaded
  const requiredElements = {
    'Court selection': document.querySelector('select, [role="combobox"]'),
    'Date calendar': document.querySelector('[role="grid"], .react-calendar'),
    'Time slots': document.querySelectorAll('button[class*="h-12"]').length > 0,
    'Payment summary': document.querySelector('[class*="sticky"]')
  }
  
  console.log('🔍 Page elements check:')
  Object.entries(requiredElements).forEach(([name, element]) => {
    console.log(`  - ${name}: ${element ? '✅ Found' : '❌ Missing'}`)
  })
  
  // Check for console errors
  const originalError = console.error
  const errors = []
  console.error = (...args) => {
    errors.push(args.join(' '))
    originalError(...args)
  }
  
  setTimeout(() => {
    console.error = originalError
    if (errors.length > 0) {
      console.log('🚨 Console errors detected:')
      errors.forEach(error => console.log('  -', error))
    } else {
      console.log('✅ No console errors detected')
    }
  }, 1000)
}

// Auto-run test when page loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testVenueBookingPayment)
  } else {
    testVenueBookingPayment()
  }
  
  // Make function available globally for manual testing
  window.testVenueBookingPayment = testVenueBookingPayment
  console.log('🧪 Venue booking test loaded. Run: testVenueBookingPayment()')
}

module.exports = { testVenueBookingPayment }
