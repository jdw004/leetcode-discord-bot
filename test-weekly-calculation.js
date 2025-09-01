const moment = require('moment');

// Test the updated weekly calculation
function testWeeklyCalculation() {
  console.log('🧪 Testing Updated Weekly Calculation\n');
  
  // Test different dates
  const testDates = [
    '2025-09-01', // Monday - should use 8/25-8/31
    '2025-09-02', // Tuesday - should use 8/25-8/31  
    '2025-09-07', // Sunday - should use 8/25-8/31
    '2025-08-31', // Sunday - should use 8/18-8/24
  ];
  
  testDates.forEach(testDate => {
    console.log(`📅 Testing date: ${testDate} (${moment(testDate).format('dddd')})`);
    
    // Simulate the new logic
    const today = moment(testDate);
    const dayOfWeek = today.day();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = moment(testDate).subtract(daysToMonday, 'days').startOf('day');
    const weekEnd = weekStart.clone().add(6, 'days').endOf('day');
    
    // For weekly updates, we want the PREVIOUS week
    const previousWeekStart = weekStart.clone().subtract(7, 'days');
    const previousWeekEnd = weekEnd.clone().subtract(7, 'days');
    
    console.log(`   Current week: ${weekStart.format('YYYY-MM-DD')} to ${weekEnd.format('YYYY-MM-DD')}`);
    console.log(`   Previous week: ${previousWeekStart.format('YYYY-MM-DD')} to ${previousWeekEnd.format('YYYY-MM-DD')}`);
    console.log(`   Days to look back: ${Math.ceil(moment(testDate).diff(previousWeekStart, 'days', true))}`);
    console.log('');
  });
  
  console.log('✅ Test completed!');
}

// Run the test
testWeeklyCalculation(); 