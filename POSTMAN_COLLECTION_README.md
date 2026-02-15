# Task Management Board - Postman Collection

This Postman collection provides a complete set of API endpoints for testing the Task Management Board application.

## Files Included

1. **Task_Management_Board.postman_collection.json** - Main collection file with all API endpoints
2. **Task_Management_Board.postman_environment.json** - Environment variables for local development

## How to Import

1. Open Postman
2. Click on **Import** button (top left)
3. Drag and drop both JSON files or click **Upload Files**
4. Select both files:
   - `Task_Management_Board.postman_collection.json`
   - `Task_Management_Board.postman_environment.json`
5. Click **Import**

## Setup Instructions

### 1. Select Environment
- In Postman, select **Task Management Board - Local** from the environment dropdown (top right)

### 2. Start the Backend Server
```bash
cd backend
docker-compose up -d  # Start MongoDB
npm start             # Start backend server on port 3000
```

### 3. Test the APIs

## API Workflow Guide

### Getting Started
1. **Register a New User**
   - Use the `Authentication > Register User` request
   - Provide name, email, and password
   - User will be created in the database

2. **Login**
   - Use the `Authentication > Login User` request
   - This automatically saves `accessToken` and `refreshToken` to environment variables
   - The access token is valid for 15 minutes

3. **Create a Project**
   - Use the `Projects > Create Project` request
   - The project ID is automatically saved to environment variables

4. **Get the Board**
   - Use the `Board & Columns > Get Project Board` request
   - This returns all columns and tasks for the project
   - Column ID and Task ID are automatically saved if available

5. **Create Tasks**
   - Use the `Tasks > Create Task` request
   - Assign priority, status, due date, and labels
   - Assign team members to tasks

## Collection Structure

### 1. Authentication (5 endpoints)
- **Register User** - Create new account
- **Login User** - Get access & refresh tokens
- **Refresh Access Token** - Get new access token
- **Get Current User** - Get authenticated user info
- **Logout User** - Invalidate refresh token

### 2. Projects (7 endpoints)
- **Create Project** - Create new project
- **Get User's Projects** - List all user projects
- **Get Project by ID** - Get single project details
- **Update Project** - Update project info
- **Invite User to Project** - Add team members
- **Remove User from Project** - Remove members
- **Delete Project** - Delete entire project

### 3. Board & Columns (2 endpoints)
- **Get Project Board** - Get complete board with columns and tasks
- **Create Column** - Add new column to board

### 4. Tasks (6 endpoints)
- **Create Task** - Add new task to project
- **Get Task by ID** - Get task details
- **Update Task** - Modify task properties
- **Move Task** - Change column or position (drag-drop)
- **Search Tasks** - Filter tasks by multiple criteria
- **Delete Task** - Remove task permanently

### 5. Comments (2 endpoints)
- **Add Comment to Task** - Add discussion comment
- **Delete Comment** - Remove comment

## Environment Variables

The collection uses the following environment variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL (default: http://localhost:3000) | No |
| `accessToken` | JWT access token | Yes (on login) |
| `refreshToken` | JWT refresh token | Yes (on login) |
| `userId` | Current user ID | Yes (on login) |
| `projectId` | Current project ID | Yes (on create) |
| `columnId` | Current column ID | Yes (on get board) |
| `taskId` | Current task ID | Yes (on create/get) |
| `commentId` | Current comment ID | Yes (on add) |
| `userIdToRemove` | User to remove from project | No |

## Features

### Automatic Token Management
- The collection automatically saves tokens after login
- Access token is included in all authenticated requests
- Use the refresh token endpoint when access token expires

### Request Chaining
- Many requests automatically save IDs to environment variables
- This allows subsequent requests to use these IDs automatically
- Example: After creating a project, the project ID is saved for use in task creation

### Request Examples
All requests include example request bodies with proper formatting

### Search & Filter
The search endpoint supports multiple query parameters:
- `text` - Search in title and description
- `priority` - Filter by priority level
- `status` - Filter by task status
- `assignedTo` - Filter by assigned user
- `labels` - Filter by labels (comma-separated)
- `dueDateFrom` & `dueDateTo` - Date range filtering

## Testing Tips

### Quick Test Flow
1. Register → Login → Create Project → Create Column → Create Task
2. All necessary IDs are automatically captured

### Token Refresh
- Access tokens expire in 15 minutes
- Use the "Refresh Access Token" endpoint to get a new one
- The new token is automatically saved

### Bulk Operations
- Create multiple projects and switch between them
- Add multiple team members to test collaboration
- Create tasks with different priorities to test filtering

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Access token has expired
   - Use the refresh token endpoint
   - Or login again

2. **404 Not Found**
   - Check that the server is running on port 3000
   - Verify the resource ID exists
   - Ensure you have access to the resource

3. **500 Internal Server Error**
   - Check MongoDB is running (`docker-compose ps`)
   - Check server logs for detailed error
   - Verify request body format

### Debug Mode
- Open Postman Console (View → Show Postman Console)
- Check request/response details
- Verify environment variables are set correctly

## Advanced Usage

### Pre-request Scripts
Some requests include pre-request scripts that:
- Validate environment variables
- Format dates
- Generate test data

### Test Scripts
Requests include test scripts that:
- Automatically save response data to variables
- Validate response format
- Log useful information to console

### Collection Runner
Use Postman's Collection Runner to:
- Run all endpoints in sequence
- Test the complete workflow
- Generate API documentation
- Perform load testing

## Export Options

### Generate Documentation
1. Click on collection options (...)
2. Select "View Documentation"
3. Click "Publish" to create public documentation

### Share Collection
1. Click on collection options (...)
2. Select "Share"
3. Generate public link or export as JSON

## Support

For issues or questions about the API:
- Check the main README.md for application setup
- Review the API route files in `backend/src/routes/`
- Check MongoDB logs: `docker-compose logs mongo`
- Check server logs in the terminal running `npm start`