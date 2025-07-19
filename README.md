# LeetCode Bot Backend

A Node.js backend service that fetches users' recent solved problems from LeetCode's GraphQL API and stores the data in organized folders.

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Fetch Recent Problems
```
GET /api/user/:username/recent-problems?days=7
```

**Parameters:**
- `username` (path): LeetCode username
- `days` (query, optional): Number of days to look back (default: 7)

**Example:**
```bash
curl "http://localhost:3000/api/user/johndoe/recent-problems?days=7"
```

### Get Stored Data
```
GET /api/user/:username/stored-data
```

**Example:**
```bash
curl "http://localhost:3000/api/user/johndoe/stored-data"
```

## Data Storage Structure

The backend stores data in the following structure:

```
data/
├── username1/
│   ├── recent_problems_2024-01-15_14-30-25.json
│   ├── recent_problems_2024-01-16_09-15-10.json
│   ├── latest.json
│   └── summary.json
├── username2/
│   ├── recent_problems_2024-01-15_16-45-30.json
│   ├── latest.json
│   └── summary.json
```

### File Types

- **`recent_problems_YYYY-MM-DD_HH-mm-ss.json`**: Timestamped data files
- **`latest.json`**: Most recent data for quick access
- **`summary.json`**: Aggregated statistics and metadata

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
LEETCODE_API_URL=https://leetcode.com/graphql
DATA_FOLDER=./data
```

## Example Response

```json
{
  "success": true,
  "username": "johndoe",
  "problemsCount": 5,
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "titleSlug": "two-sum",
      "difficulty": "Easy",
      "categoryTitle": "Array",
      "status": "accepted",
      "timestamp": 1705312800,
      "timeAgo": "2 days ago",
      "fetchedAt": "2024-01-15T14:30:25.123Z",
      "dateRange": {
        "start": "2024-01-08",
        "end": "2024-01-15"
      }
    }
  ],
  "timestamp": "2024-01-15T14:30:25.123Z"
}
```

## Development

### Project Structure

```
src/
├── index.js              # Main Express server
└── services/
    ├── leetcodeService.js # LeetCode API integration
    └── dataService.js     # Data storage and retrieval
```

### Adding New Features

1. **New API Endpoints**: Add routes in `src/index.js`
2. **GraphQL Queries**: Extend `src/services/leetcodeService.js`
3. **Data Processing**: Modify `src/services/dataService.js`

## Troubleshooting

### Common Issues

1. **"User not found"**: Check if the LeetCode username is correct
2. **"No data returned"**: User might have a private profile
3. **Network errors**: Check internet connection and LeetCode API status

### Debug Mode

Enable detailed logging by setting the environment variable:
```bash
DEBUG=* npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This backend uses LeetCode's public GraphQL API. Please respect their terms of service and rate limits. 