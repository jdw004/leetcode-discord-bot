const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const config = require('../../config');

class DataService {
  constructor() {
    this.dataFolder = config.DATA_FOLDER;
    this.ensureDataFolder();
  }

  async ensureDataFolder() {
    try {
      await fs.ensureDir(this.dataFolder);
      console.log(`📁 Data folder ensured: ${this.dataFolder}`);
    } catch (error) {
      console.error('Error creating data folder:', error);
    }
  }

  async storeUserProblems(username, problems) {
    try {
      const userFolder = path.join(this.dataFolder, username);
      await fs.ensureDir(userFolder);

      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const filename = `recent_problems_${timestamp}.json`;
      const filepath = path.join(userFolder, filename);

      const dataToStore = {
        username,
        fetchedAt: new Date().toISOString(),
        problemsCount: problems.length,
        problems,
        metadata: {
          totalProblems: problems.length,
          dateRange: problems[0]?.dateRange || {},
          difficulties: this.getDifficultyStats(problems),
          categories: this.getCategoryStats(problems)
        }
      };

      await fs.writeJson(filepath, dataToStore, { spaces: 2 });
      
      // Also create a latest.json file for easy access
      const latestFilepath = path.join(userFolder, 'latest.json');
      await fs.writeJson(latestFilepath, dataToStore, { spaces: 2 });

      console.log(`💾 Stored ${problems.length} problems for ${username} in ${filepath}`);
      
      // Create a summary file
      await this.createSummaryFile(username, dataToStore);
      
      return {
        success: true,
        filepath,
        problemsCount: problems.length
      };
    } catch (error) {
      console.error('Error storing user problems:', error);
      throw error;
    }
  }

  async getStoredUserProblems(username) {
    try {
      const userFolder = path.join(this.dataFolder, username);
      
      if (!await fs.pathExists(userFolder)) {
        return {
          success: false,
          message: 'No data found for this user'
        };
      }

      // Try to get the latest data
      const latestFilepath = path.join(userFolder, 'latest.json');
      if (await fs.pathExists(latestFilepath)) {
        const data = await fs.readJson(latestFilepath);
        return {
          success: true,
          data,
          source: 'latest.json'
        };
      }

      // If no latest.json, get the most recent file
      const files = await fs.readdir(userFolder);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        return {
          success: false,
          message: 'No data files found for this user'
        };
      }

      // Sort by modification time and get the most recent
      const fileStats = await Promise.all(
        jsonFiles.map(async (file) => {
          const filepath = path.join(userFolder, file);
          const stats = await fs.stat(filepath);
          return { file, filepath, mtime: stats.mtime };
        })
      );

      const mostRecent = fileStats.sort((a, b) => b.mtime - a.mtime)[0];
      const data = await fs.readJson(mostRecent.filepath);

      return {
        success: true,
        data,
        source: mostRecent.file
      };
    } catch (error) {
      console.error('Error retrieving stored user problems:', error);
      throw error;
    }
  }

  async createSummaryFile(username, data) {
    try {
      const userFolder = path.join(this.dataFolder, username);
      const summaryFilepath = path.join(userFolder, 'summary.json');
      
      const summary = {
        username,
        lastUpdated: data.fetchedAt,
        totalProblems: data.problemsCount,
        difficulties: data.metadata.difficulties,
        categories: data.metadata.categories,
        dateRange: data.metadata.dateRange,
        recentProblems: data.problems.slice(0, 10) // Last 10 problems
      };

      await fs.writeJson(summaryFilepath, summary, { spaces: 2 });
      console.log(`📊 Created summary for ${username}`);
    } catch (error) {
      console.error('Error creating summary file:', error);
    }
  }

  getDifficultyStats(problems) {
    const stats = {};
    problems.forEach(problem => {
      const difficulty = problem.difficulty || 'Unknown';
      stats[difficulty] = (stats[difficulty] || 0) + 1;
    });
    return stats;
  }

  getCategoryStats(problems) {
    const stats = {};
    problems.forEach(problem => {
      const category = problem.categoryTitle || 'Unknown';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }

  async getAllUsers() {
    try {
      if (!await fs.pathExists(this.dataFolder)) {
        return [];
      }

      const users = await fs.readdir(this.dataFolder);
      const userData = [];

      for (const user of users) {
        const userFolder = path.join(this.dataFolder, user);
        const stats = await fs.stat(userFolder);
        
        if (stats.isDirectory()) {
          const summaryFilepath = path.join(userFolder, 'summary.json');
          let summary = null;
          
          if (await fs.pathExists(summaryFilepath)) {
            summary = await fs.readJson(summaryFilepath);
          }

          userData.push({
            username: user,
            lastUpdated: summary?.lastUpdated || null,
            totalProblems: summary?.totalProblems || 0,
            difficulties: summary?.difficulties || {},
            categories: summary?.categories || {}
          });
        }
      }

      return userData;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
}

module.exports = new DataService(); 