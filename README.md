**Hacker News Scraper**

A Node.js-based backend service to scrape real-time stories from [Hacker News](https://news.ycombinator.com/), broadcast real-time updates via WebSocket, and expose APIs to access the scraped data.

---

## **Features**

- Periodically scrape top stories from Hacker News every 5 minutes.
- Store scraped stories in a MySQL database.
- Provide REST APIs for accessing paginated stories.
- Broadcast real-time updates to connected WebSocket clients.
- JWT-based authentication for secure API access.
- Efficient caching to optimize database queries.

---

## **Technologies Used**

- **Backend**: Node.js (Express)
- **Database**: MySQL
- **WebSocket**: `ws`
- **Authentication**: JSON Web Tokens (JWT)
- **Scraping**: Axios and Hacker News API
- **Caching**: Node Cache
- **Task Scheduler**: node-cron

---

## **Setup Instructions**

### **Prerequisites**
- Node.js (v14 or later)
- MySQL (running locally or on a remote server)
- Git (optional, for cloning the repository)

---

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/<your-username>/hn-scraper.git
cd hn-scraper
```

---

### **Step 2: Install Dependencies**
Run the following command in the project directory:
```bash
npm install
```

---

### **Step 3: Set Up MySQL Database**
1. Log in to your MySQL instance and run the following SQL commands to create the database and table:
   ```sql
   CREATE DATABASE hackernews;

   USE hackernews;

   CREATE TABLE stories (
       id INT PRIMARY KEY AUTO_INCREMENT,
       story_id INT NOT NULL UNIQUE,
       title VARCHAR(255),
       url VARCHAR(255),
       author VARCHAR(255),
       score INT,
       time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Update the `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hackernews
   JWT_SECRET=your_super_secret_key
   PORT=3000
   ```

---

### **Step 4: Start the Server**
Start the application using:
```bash
node server.js
```
The server will start at `http://localhost:3000`.

---

## **Usage Examples**

### **1. Authentication (Login)**

Generate a JWT token for API access by logging in.

#### **Endpoint**
- **POST** `/login`

#### **Request Body**
```json
{
  "username": "admin",
  "password": "password"
}
```

#### **Response**
```json
{
  "token": "your_jwt_token_here"
}
```

---

### **2. Fetch Paginated Stories**

Retrieve paginated stories from the database.

#### **Endpoint**
- **GET** `/stories`

#### **Headers**
```json
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

#### **Query Parameters**
| Parameter | Description                   | Default |
|-----------|-------------------------------|---------|
| `page`    | The page number (1-based)     | 1       |
| `limit`   | Number of stories per page    | 10      |

#### **Example Request**
```bash
curl -X GET "http://localhost:3000/stories?page=1&limit=5" \
-H "Authorization: Bearer your_jwt_token_here"
```

#### **Response**
```json
[
  {
    "id": 1,
    "story_id": 33865987,
    "title": "Interesting Hacker News Story",
    "url": "https://example.com",
    "author": "username",
    "score": 123,
    "time": "2023-01-19T15:30:00.000Z"
  },
  ...
]
```

---

### **3. WebSocket Streaming**

Receive real-time updates about new stories via WebSocket.

#### **WebSocket URL**
```text
ws://localhost:3000
```

#### **How It Works**
1. Connect to the WebSocket server.
2. On connection:
   - The server sends the count of stories added in the last 5 minutes:
     ```json
     {
       "type": "initial",
       "count": 5
     }
     ```

3. Every 5 minutes (after a new scrape):
   - The server sends a real-time update:
     ```json
     {
       "type": "update",
       "message": "New stories available!"
     }
     ```

#### **Testing WebSocket**
Use a tool like [WebSocket King](https://websocketking.com/) or any WebSocket client to connect and test.

---

## **Project Structure**

```plaintext
hn-scraper/
├── database.js       # Handles database operations
├── logger.js         # Configures and handles logging
├── scraper.js        # Scrapes stories from Hacker News
├── server.js         # Main entry point of the application
├── websocket.js      # WebSocket server implementation
├── .env              # Environment variables
├── package.json      # Project dependencies and scripts
├── README.md         # Documentation
```

---

## **Troubleshooting**

| Issue                             | Solution                                                                                     |
|-----------------------------------|---------------------------------------------------------------------------------------------|
| Cannot connect to database        | Check your MySQL credentials in `.env` and ensure the database is running.                  |
| 401 Unauthorized error on `/stories` | Ensure you include a valid JWT token in the `Authorization` header.                        |
| WebSocket not connecting          | Verify the WebSocket URL is correct (`ws://localhost:3000`) and the server is running.       |
| Port conflict                     | Update the `PORT` value in `.env` to an unused port.                                         |

---

## **Contributing**

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

