const fs = require('fs-extra');
const path = require('path');

async function showDataStructure() {
  console.log('📁 LeetCode Bot Data Structure');
  console.log('================================\n');

  const dataFolder = './data';
  
  if (!await fs.pathExists(dataFolder)) {
    console.log('❌ No data folder found. Run the backend first!');
    return;
  }

  const users = await fs.readdir(dataFolder);
  
  if (users.length === 0) {
    console.log('📭 No user data found yet.');
    return;
  }

  console.log(`Found ${users.length} user(s) with data:\n`);

  for (const user of users) {
    const userFolder = path.join(dataFolder, user);
    const stats = await fs.stat(userFolder);
    
    if (stats.isDirectory()) {
      console.log(`👤 User: ${user}`);
      console.log(`   📂 Folder: ${userFolder}`);
      
      const files = await fs.readdir(userFolder);
      console.log(`   📄 Files: ${files.length}`);
      
      for (const file of files) {
        const filepath = path.join(userFolder, file);
        const fileStats = await fs.stat(filepath);
        const sizeKB = (fileStats.size / 1024).toFixed(2);
        
        console.log(`      - ${file} (${sizeKB} KB)`);
        
        // Show summary for summary.json
        if (file === 'summary.json') {
          try {
            const summary = await fs.readJson(filepath);
            console.log(`        📊 Total problems: ${summary.totalProblems}`);
            console.log(`        📅 Last updated: ${summary.lastUpdated}`);
            console.log(`        🎯 Difficulties: ${JSON.stringify(summary.difficulties)}`);
          } catch (error) {
            console.log(`        ❌ Error reading summary: ${error.message}`);
          }
        }
      }
      console.log('');
    }
  }

  // Show example of latest data
  if (users.length > 0) {
    const firstUser = users[0];
    const latestFile = path.join(dataFolder, firstUser, 'latest.json');
    
    if (await fs.pathExists(latestFile)) {
      console.log('📋 Example of stored data structure:');
      console.log('=====================================\n');
      
      try {
        const data = await fs.readJson(latestFile);
        console.log(`Username: ${data.username}`);
        console.log(`Problems found: ${data.problemsCount}`);
        console.log(`Fetched at: ${data.fetchedAt}`);
        
        if (data.problems && data.problems.length > 0) {
          console.log('\n📝 Sample problems:');
          data.problems.slice(0, 3).forEach((problem, index) => {
            console.log(`   ${index + 1}. ${problem.title}`);
            console.log(`      - Slug: ${problem.titleSlug}`);
            console.log(`      - Status: ${problem.status}`);
            console.log(`      - Time ago: ${problem.timeAgo}`);
          });
        }
        
        if (data.metadata) {
          console.log('\n📊 Metadata:');
          console.log(`   Date range: ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}`);
          console.log(`   Difficulties: ${JSON.stringify(data.metadata.difficulties)}`);
          console.log(`   Categories: ${JSON.stringify(data.metadata.categories)}`);
        }
      } catch (error) {
        console.log(`❌ Error reading latest data: ${error.message}`);
      }
    }
  }
}

// Run the script
showDataStructure(); 