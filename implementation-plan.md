# Implementation Plan: Freelancer Marketplace (Fiverr-like Platform)

## Project Overview
**Name:** Your preferred name
**Concept:** A platform where freelancers offer services (gigs) in different fields, and clients can browse, search, and book services.
**Team Size:** 4-5 students
**Timeline:** Week 4 - Week 12 (8 weeks)
**Worth:** 70% of final grade

---

## Database Schema (MongoDB - 3 Collections)

### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String (enum: ['freelancer', 'client', 'both']),
  profileImage: String (file path),
  bio: String,
  skills: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Gigs Collection** (Services offered by freelancers)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  price: Number,
  freelancerId: ObjectId (ref: 'User'),
  images: [String], // file paths
  deliveryTime: Number (days),
  tags: [String],
  status: String (enum: ['active', 'paused', 'deleted']),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **Orders Collection**
```javascript
{
  _id: ObjectId,
  gigId: ObjectId (ref: 'Gig'),
  clientId: ObjectId (ref: 'User'),
  freelancerId: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'in-progress', 'completed', 'cancelled']),
  totalPrice: Number,
  requirements: String, // Client's specific requirements
  deliveryDate: Date,
  orderDate: Date,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Database Relations:**
- Users → Gigs (one-to-many: one freelancer can have many gigs)
- Users → Orders (one-to-many: one client can have many orders)
- Gigs → Orders (one-to-many: one gig can have many orders)

**Total:** 3 collections, 3 relationships ✅

---

## Implementation Phases (Step-by-Step Build)

### **Phase 1: Project Setup & Environment** (Week 4-5)
**Duration:** 3-4 days
**Goal:** Get the development environment ready

#### Tasks:
1. **Initialize Node.js Project**
   ```bash
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install express mongoose ejs express-session bcryptjs dotenv
   npm install multer express-validator cookie-parser
   npm install bootstrap@5
   npm install --save-dev nodemon
   ```

3. **Create Folder Structure**
   ```
   CareFreelancer/
   ├── models/
   │   ├── User.js
   │   ├── Gig.js
   │   └── Order.js
   ├── routes/
   │   ├── auth.js
   │   ├── gigs.js
   │   └── orders.js
   ├── views/
   │   ├── partials/
   │   │   ├── header.ejs
   │   │   ├── footer.ejs
   │   │   └── navbar.ejs
   │   ├── auth/
   │   │   ├── login.ejs
   │   │   └── register.ejs
   │   ├── gigs/
   │   │   ├── list.ejs
   │   │   ├── detail.ejs
   │   │   └── create.ejs
   │   ├── orders/
   │   │   ├── list.ejs
   │   │   └── detail.ejs
   │   └── index.ejs (homepage)
   ├── public/
   │   ├── css/
   │   │   └── style.css
   │   ├── js/
   │   │   └── main.js
   │   └── uploads/
   │       ├── profiles/
   │       └── gigs/
   ├── middleware/
   │   └── auth.js
   ├── config/
   │   └── database.js
   ├── .env
   ├── .gitignore
   ├── app.js
   ├── package.json
   └── Dockerfile
   ```

4. **Configure MongoDB Connection**
   - Set up MongoDB Atlas account (free tier) OR local MongoDB
   - Create database connection in `config/database.js`

5. **Set up Basic Express Server**
   - Create `app.js` with Express setup
   - Configure EJS as view engine
   - Set up static files serving
   - Configure session middleware

6. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial project setup"
   ```

7. **Create `.env` file** for environment variables
   ```
   MONGODB_URI=mongodb://localhost:27017/freelancehub
   SESSION_SECRET=your-secret-key
   PORT=3000
   ```

8. **Test Basic Server**
   - Create simple homepage route
   - Run server and verify it works

**Deliverable:** Working Node.js server with MongoDB connection

---

### **Phase 2: Authentication System** (Week 5-6)
**Duration:** 4-5 days
**Goal:** Implement complete user authentication

#### Tasks:
1. **Create User Model** (`models/User.js`)
   - Define schema with validation
   - Add password hashing middleware (bcrypt)
   - Add methods for password comparison

2. **Build Registration Page** (`views/auth/register.ejs`)
   - Form with username, email, password, confirm password
   - Role selection (freelancer/client)
   - Client-side validation with JavaScript
   - Bootstrap styling

3. **Implement Registration Logic** (`routes/auth.js`)
   - Server-side validation (express-validator)
   - Check if user exists
   - Hash password
   - Save user to database
   - Handle errors appropriately

4. **Build Login Page** (`views/auth/login.ejs`)
   - Form with username/email and password
   - "Remember me" checkbox
   - Bootstrap styling

5. **Implement Login Logic**
   - Verify credentials
   - Compare hashed passwords
   - Create session
   - Redirect to appropriate page

6. **Create Authentication Middleware** (`middleware/auth.js`)
   - `isAuthenticated` - check if user is logged in
   - `isFreelancer` - check if user is a freelancer
   - `isClient` - check if user is a client

7. **Implement Logout Functionality**
   - Destroy session
   - Redirect to homepage

8. **Create User Profile Page**
   - Display user information
   - Edit profile functionality (UPDATE operation)

**Assignment Requirements Met:**
- ✅ User login with username and password
- ✅ Email collection
- ✅ Sessions for continuity
- ✅ Form validation
- ✅ Unauthorized access prevention
- ✅ UPDATE operation (edit profile)

**Deliverable:** Complete authentication system

---

### **Phase 3: Core Features - Gigs (Services)** (Week 6-7)
**Duration:** 5-6 days
**Goal:** Freelancers can create and manage their service offerings

#### Tasks:
1. **Create Gig Model** (`models/Gig.js`)
   - Define schema with all required fields
   - Add validation
   - Set up reference to User model

2. **Build "Post a Gig" Form** (`views/gigs/create.ejs`)
   This form meets ALL complex form requirements:

   - **Input Fields** (3+):
     - Gig Title (text input)
     - Price (number input)
     - Delivery Time in days (number input)

   - **Radio Buttons** (4+ options):
     - Category selection:
       - ○ Web Development
       - ○ Graphic Design
       - ○ Writing & Translation
       - ○ Digital Marketing
       - ○ Video & Animation

   - **Checkboxes** (4+ options):
     - Skills/Tags:
       - ☐ HTML/CSS
       - ☐ JavaScript
       - ☐ Node.js
       - ☐ React
       - ☐ Python
       - ☐ SEO

   - **Text Area**:
     - Gig Description (detailed description of the service)

   - **File Upload**:
     - Gig Images (multiple files)
     - Restrictions: Max 5MB per image, only .jpg, .png, .jpeg

   - Client-side validation with JavaScript
   - Bootstrap styling for professional look

3. **Implement File Upload** (`routes/gigs.js`)
   - Configure Multer middleware
   - Set file size limits (5MB)
   - Set allowed file types (.jpg, .png, .jpeg)
   - Handle upload errors
   - Save file paths to database

4. **Implement Gig Creation Logic**
   - Server-side validation
   - Process form data
   - Save gig to database (WRITE operation)
   - Associate with logged-in freelancer
   - Redirect to gig detail page

5. **Create Gig Listing Page** (`views/gigs/list.ejs`)
   - Display all active gigs
   - Show gig image, title, price, freelancer name
   - Grid layout with Bootstrap cards
   - Link to individual gig pages

6. **Build Gig Detail Page** (`views/gigs/detail.ejs`)
   - Display full gig information
   - Show all uploaded images (image carousel)
   - Display freelancer profile
   - "Order Now" button for clients
   - Edit/Delete buttons for gig owner

7. **Implement Gig Management**
   - Edit gig functionality (UPDATE operation)
   - Delete gig functionality (soft delete - change status)
   - View freelancer's own gigs

8. **Add Navigation**
   - Update navbar with links to browse gigs, post gig (if freelancer)
   - Add user menu with profile, dashboard links

**Assignment Requirements Met:**
- ✅ Complex form with all requirements (3+ inputs, radio buttons, checkboxes, textarea, file upload)
- ✅ File upload with size and type restrictions
- ✅ WRITE operation (create gig)
- ✅ READ operation (view gigs)
- ✅ UPDATE operation (edit gig)
- ✅ Bootstrap styling
- ✅ JavaScript DOM manipulation (form validation, image preview)

**Deliverable:** Complete gig creation and management system

**🔴 MEETING 1 (Week 7):** Demonstrate authentication + gig posting to instructor

---

### **Phase 4: Search & Advanced Features** (Week 8-9)
**Duration:** 5-6 days
**Goal:** Implement search, filtering, sorting, and pagination

#### Tasks:
1. **Implement Search Functionality**
   - Add search bar to navbar (separate from complex form)
   - Search by:
     - Gig title (partial match, case-insensitive)
     - Category
     - Tags/Skills
     - Freelancer username
   - Use MongoDB text search or regex
   - Display "X results found for 'search term'"

2. **Build Search Results Page** (`views/gigs/search.ejs`)
   - Display results in table format:
     - Columns: Image, Title, Category, Price, Delivery Time, Freelancer
   - Show message if no results found
   - Bootstrap table styling

3. **Implement Dynamic Sorting**
   - Make column headers clickable
   - Sort by:
     - Price (ascending/descending)
     - Delivery Time (fastest first/slowest first)
     - Date Created (newest/oldest)
   - Use JavaScript to handle sorting without page reload
   - Show sort indicator (↑ ↓) on active column
   - Update URL with sort parameters

4. **Implement Pagination**
   - Limit results to 10 per page
   - Create pagination component
   - Show:
     - Previous button
     - Page numbers (1, 2, 3...)
     - Next button
   - Highlight current page
   - Ensure at least one search returns 10+ results
   - Use Bootstrap pagination component

5. **Add Filtering by Category**
   - Category filter dropdown
   - Checkbox filters for skills/tags
   - Combine with search functionality
   - Show active filters with option to clear

6. **Improve Search UX**
   - Show loading indicator during search
   - Highlight search terms in results
   - "Clear all filters" button
   - Display result count

7. **Optimize Database Queries**
   - Add indexes to searchable fields
   - Implement efficient pagination queries
   - Use MongoDB aggregation if needed

**Assignment Requirements Met:**
- ✅ Search functionality (searches database)
- ✅ Sorting results dynamically (click column headers)
- ✅ Pagination (10 results per page with "next ten results")
- ✅ JavaScript DOM manipulation (sorting, pagination)
- ✅ READ operation from database

**Deliverable:** Complete search system with sorting and pagination

---

### **Phase 5: Orders System** (Week 9-10)
**Duration:** 4-5 days
**Goal:** Clients can order gigs, manage orders

#### Tasks:
1. **Create Order Model** (`models/Order.js`)
   - Define schema with all fields
   - Set up references to User and Gig models
   - Add validation

2. **Build Order Creation Flow**
   - "Order Now" button on gig detail page
   - Order form where client provides requirements
   - Confirm order page showing price, delivery date
   - Process order creation (WRITE operation)
   - Send confirmation

3. **Create Orders Dashboard**
   - **For Clients** (`views/orders/client-orders.ejs`):
     - View all orders placed
     - Filter by status (pending, in-progress, completed)
     - Cancel pending orders

   - **For Freelancers** (`views/orders/freelancer-orders.ejs`):
     - View all orders received
     - Update order status
     - Mark as completed

4. **Implement Order Detail Page** (`views/orders/detail.ejs`)
   - Show all order information
   - Display gig details
   - Show client requirements
   - Status timeline
   - Update status functionality (UPDATE operation)

5. **Add Order Management Logic**
   - Create order
   - Update order status
   - Cancel order (if pending)
   - View order history

6. **Update Navigation**
   - Add "My Orders" link for clients
   - Add "Orders Received" link for freelancers
   - Show notification badge for new orders

7. **Populate Sample Data**
   - Create seed script to populate database
   - Add 10+ sample users (freelancers and clients)
   - Add 15+ sample gigs across different categories
   - Add 20+ sample orders (ensure at least one query returns 10+ results)

**Assignment Requirements Met:**
- ✅ Third database collection (Orders)
- ✅ Database relationships (User-Order-Gig)
- ✅ WRITE operation (create order)
- ✅ UPDATE operation (update order status)
- ✅ READ operation (view orders)

**Deliverable:** Complete order management system

**🔴 MEETING 2 (Week 10):** Demonstrate search, orders, full workflow to instructor

---

### **Phase 6: UI/UX Enhancement & Security** (Week 10-11)
**Duration:** 4-5 days
**Goal:** Polish the application, ensure security, improve user experience

#### Tasks:
1. **Apply Bootstrap Styling Throughout**
   - Use Bootstrap 5 components:
     - Navbar with dropdown menus
     - Cards for gigs
     - Forms with proper styling
     - Buttons with appropriate colors
     - Alerts for messages
     - Modals for confirmations
     - Badges for status indicators
   - Ensure responsive design (mobile-friendly)
   - Create consistent color scheme
   - Add custom CSS in `public/css/style.css`

2. **Implement Comprehensive Form Validation**
   - **Client-side validation** (JavaScript):
     - Real-time validation as user types
     - Show error messages inline
     - Disable submit button if invalid
     - Visual feedback (red/green borders)

   - **Server-side validation** (express-validator):
     - Validate all inputs
     - Sanitize data
     - Return meaningful error messages
     - Prevent SQL injection, XSS attacks

3. **Error Handling**
   - Create error pages (404, 500)
   - Display user-friendly error messages
   - Use flash messages for success/error notifications
   - Handle file upload errors gracefully
   - Validate file types and sizes
   - Handle database errors

4. **Security Enhancements**
   - **Prevent unauthorized access**:
     - Protect routes with authentication middleware
     - Verify user owns resource before edit/delete
     - Redirect unauthorized users

   - **Session security**:
     - Set secure session options
     - Implement session timeout
     - CSRF protection

   - **Input sanitization**:
     - Prevent XSS attacks
     - Escape user-generated content in views
     - Validate and sanitize all inputs

5. **Browser Compatibility Testing**
   - Test on Chrome, Firefox, Edge, Safari
   - Ensure forms work on all browsers
   - Test JavaScript functionality
   - Fix any compatibility issues

6. **Performance Optimization**
   - Optimize images (compress uploaded files)
   - Minimize CSS/JavaScript
   - Add loading states for async operations
   - Optimize database queries
   - Implement caching where appropriate

7. **User Experience Improvements**
   - Add breadcrumbs for navigation
   - Implement "Back to top" button
   - Add tooltips for complex features
   - Show loading spinners for async operations
   - Add confirmation dialogs for destructive actions
   - Implement "Are you sure?" for delete operations

8. **Accessibility**
   - Add proper ARIA labels
   - Ensure keyboard navigation works
   - Add alt text to images
   - Ensure good color contrast

**Assignment Requirements Met:**
- ✅ UI/UX design (usability, navigation, error handling)
- ✅ Form validation (client and server-side)
- ✅ Browser compatibility
- ✅ Unauthorized access prevention
- ✅ Sessions security
- ✅ Bootstrap usage (extra credit)

**Deliverable:** Polished, secure, user-friendly application

---

### **Phase 7: Docker, Testing & Final Submission** (Week 11-12)
**Duration:** 5-6 days
**Goal:** Deploy with Docker, test thoroughly, prepare submission

#### Tasks:
1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     web:
       build: .
       ports:
         - "3000:3000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/freelancehub
       depends_on:
         - mongo
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db
   volumes:
     mongo-data:
   ```

3. **Test Docker Deployment**
   ```bash
   docker-compose up --build
   ```
   - Verify application runs in container
   - Test all functionality in Docker environment
   - Fix any Docker-related issues

4. **Comprehensive Testing Checklist**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Session persistence works
   - [ ] Freelancers can create gigs
   - [ ] File upload works with restrictions
   - [ ] All form validations work
   - [ ] Search functionality works
   - [ ] Sorting works (click columns)
   - [ ] Pagination works (10 results per page)
   - [ ] Clients can place orders
   - [ ] Order status updates work
   - [ ] Edit profile works
   - [ ] Edit gig works
   - [ ] Delete gig works
   - [ ] Unauthorized access is prevented
   - [ ] Error messages display properly
   - [ ] Works on multiple browsers
   - [ ] Responsive on mobile devices

5. **Verify All Assignment Requirements**
   - [ ] Login requirement ✅
   - [ ] Complex form requirement ✅
   - [ ] Search requirement ✅
   - [ ] Sorting results ✅
   - [ ] Pagination ✅
   - [ ] File upload ✅
   - [ ] Sessions ✅
   - [ ] Form validation ✅
   - [ ] 3+ database tables ✅
   - [ ] 2+ relationships ✅
   - [ ] READ operation ✅
   - [ ] WRITE operation ✅
   - [ ] UPDATE operation ✅
   - [ ] SEARCH operation ✅
   - [ ] HTML5 with semantic tags ✅
   - [ ] CSS3 ✅
   - [ ] JavaScript with DOM manipulation ✅
   - [ ] Bootstrap ✅
   - [ ] Node.js with Express ✅
   - [ ] MongoDB with Mongoose ✅
   - [ ] EJS ✅
   - [ ] RESTful API ✅
   - [ ] Docker ✅

6. **Prepare GitHub Repository**
   - Create README.md with:
     - Project description
     - Features list
     - Installation instructions
     - How to run with Docker
     - Technology stack
     - Team members and contributions
     - Screenshots
   - Create .gitignore (exclude node_modules, .env, uploads)
   - Ensure clean commit history
   - Push to GitHub
   - Make repository public or share with instructor

7. **Create Demonstration Video (10-15 minutes)**

   **Video Structure:**

   **Introduction (1 min)**
   - Team member introductions
   - Project overview
   - Technology stack

   **Feature Demonstrations (8-10 min)**
   - User registration and login
   - Session persistence (logout, login again)
   - Post a gig (show complex form with all elements)
   - File upload demonstration
   - Browse gigs
   - Search functionality
   - Sorting demonstration (click columns)
   - Pagination demonstration (show 10+ results)
   - Place an order
   - Manage orders (update status)
   - Edit profile/gig
   - Error handling examples
   - Security features (try unauthorized access)

   **Individual Contributions (3-4 min)**
   - **Team Member 1**: "I worked on authentication system and user models"
   - **Team Member 2**: "I built the gig creation and management features"
   - **Team Member 3**: "I implemented search, sorting, and pagination"
   - **Team Member 4**: "I developed the order system and UI styling"
   - **Team Member 5** (if applicable): "I handled Docker deployment and testing"

   **Conclusion (1 min)**
   - Summary of features
   - Challenges overcome
   - Thank you

   **Recording Tips:**
   - Use screen recording software (OBS Studio, Loom, etc.)
   - Test audio before recording
   - Have a script prepared
   - Show actual functionality, not just code
   - Ensure good pacing (not too fast)

8. **Prepare Peer Assessment**
   - Each member fills out individual peer assessment form
   - Be honest about contributions
   - Submit on Teammates platform

9. **Final Submission (Week 12)**
   - [ ] GitHub repository URL
   - [ ] Video uploaded to classroom
   - [ ] Peer assessment submitted
   - [ ] All team members verified submission

   **IMPORTANT:** Zero tolerance for late submissions!

**Deliverable:** Complete project ready for submission

---

## Technology Stack Breakdown

### Frontend Technologies

#### 1. **HTML5** (Semantic Tags)
Use semantic tags throughout:
- `<header>` - Site header with logo and navigation
- `<nav>` - Navigation menu
- `<main>` - Main content area
- `<section>` - Sections within pages
- `<article>` - Individual gig cards
- `<aside>` - Sidebar for filters
- `<footer>` - Site footer
- `<form>` - All forms
- `<figure>` and `<figcaption>` - For images

#### 2. **CSS3**
Features to use:
- Flexbox for layouts
- Grid for gig listings
- Transitions for hover effects
- Media queries for responsiveness
- Custom properties (CSS variables) for theming
- Animations for loading states

#### 3. **Bootstrap 5**
Components to use:
- Navbar with dropdowns
- Cards for gigs
- Forms (form-control, form-select, etc.)
- Buttons (btn, btn-primary, etc.)
- Modals for confirmations
- Alerts for messages
- Pagination
- Badges for status
- Breadcrumbs for navigation
- Carousel for image galleries
- Grid system for responsive layouts

#### 4. **JavaScript (DOM Manipulation)**
Use cases:
- Form validation (real-time)
- Dynamic sorting (click column headers)
- Pagination (previous/next buttons)
- Image preview before upload
- Modal dialogs (confirm delete)
- AJAX for search without page reload
- Toggle filters
- Show/hide elements
- Character counter for textarea
- Password strength indicator

Example DOM manipulation:
```javascript
// Dynamic sorting
document.querySelectorAll('th.sortable').forEach(header => {
  header.addEventListener('click', function() {
    const column = this.dataset.column;
    sortTable(column);
  });
});

// Form validation
document.getElementById('gigForm').addEventListener('submit', function(e) {
  const title = document.getElementById('title').value;
  if (title.length < 5) {
    e.preventDefault();
    showError('Title must be at least 5 characters');
  }
});
```

### Backend Technologies

#### 1. **Node.js**
- JavaScript runtime for server-side code
- Use async/await for asynchronous operations
- Handle file system operations for uploads

#### 2. **Express.js**
Framework features to use:
- Routing (`express.Router()`)
- Middleware (authentication, validation)
- Static file serving
- Session management
- Cookie parsing
- Body parsing (JSON, URL-encoded)

Basic Express setup:
```javascript
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ /* config */ }));
```

#### 3. **MongoDB with Mongoose**
Mongoose features:
- Schema definitions with validation
- Model creation
- CRUD operations
- Population (joining collections)
- Indexes for performance
- Middleware (pre/post hooks)
- Virtual properties
- Schema validation

Example model:
```javascript
const gigSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 5 },
  price: { type: Number, required: true, min: 5 },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gig', gigSchema);
```

#### 4. **EJS (Templating)**
Features to use:
- Layouts with partials (header, footer, navbar)
- Pass data from routes to views
- Loops for displaying arrays
- Conditionals for logic
- Includes for reusable components
- Escape HTML to prevent XSS

Example EJS:
```ejs
<%- include('partials/header') %>

<h1><%= gig.title %></h1>

<% if (user && user._id.equals(gig.freelancerId)) { %>
  <a href="/gigs/<%= gig._id %>/edit">Edit</a>
<% } %>

<% gigs.forEach(gig => { %>
  <div class="card">
    <h3><%= gig.title %></h3>
  </div>
<% }); %>

<%- include('partials/footer') %>
```

#### 5. **RESTful API**
Design RESTful routes:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Homepage |
| GET | `/register` | Show registration form |
| POST | `/register` | Create user account |
| GET | `/login` | Show login form |
| POST | `/login` | Authenticate user |
| GET | `/logout` | Logout user |
| GET | `/gigs` | List all gigs |
| GET | `/gigs/create` | Show create gig form |
| POST | `/gigs` | Create new gig |
| GET | `/gigs/:id` | Show gig details |
| GET | `/gigs/:id/edit` | Show edit gig form |
| PUT/POST | `/gigs/:id` | Update gig |
| DELETE/POST | `/gigs/:id/delete` | Delete gig |
| GET | `/search` | Search gigs |
| GET | `/orders` | List user's orders |
| POST | `/orders` | Create new order |
| GET | `/orders/:id` | Show order details |
| PUT/POST | `/orders/:id` | Update order status |
| GET | `/profile` | Show user profile |
| POST | `/profile` | Update user profile |

### Additional Libraries

#### 1. **bcryptjs**
- Hash passwords before storing
- Compare passwords during login
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, user.password);
```

#### 2. **express-session**
- Manage user sessions
- Store session data
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));
```

#### 3. **multer**
- Handle file uploads
- Validate file types and sizes
```javascript
const multer = require('multer');
const upload = multer({
  dest: 'public/uploads/gigs/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});
```

#### 4. **express-validator**
- Server-side form validation
- Sanitize inputs
```javascript
const { body, validationResult } = require('express-validator');

router.post('/gigs', [
  body('title').isLength({ min: 5 }).trim().escape(),
  body('price').isNumeric().isFloat({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('gigs/create', { errors: errors.array() });
  }
  // Process form
});
```

#### 5. **dotenv**
- Manage environment variables
```javascript
require('dotenv').config();
const dbUri = process.env.MONGODB_URI;
```

---

## File Structure Details

### Key Files to Create

#### 1. **app.js** (Main Application File)
```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

// Database connection
require('./config/database');

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/gigs', require('./routes/gigs'));
app.use('/orders', require('./routes/orders'));

// Error handling
app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 2. **config/database.js**
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
```

#### 3. **middleware/auth.js**
```javascript
module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect('/auth/login');
  },

  isFreelancer: (req, res, next) => {
    if (req.session.user &&
        (req.session.user.role === 'freelancer' ||
         req.session.user.role === 'both')) {
      return next();
    }
    res.status(403).send('Access denied');
  },

  isClient: (req, res, next) => {
    if (req.session.user &&
        (req.session.user.role === 'client' ||
         req.session.user.role === 'both')) {
      return next();
    }
    res.status(403).send('Access denied');
  }
};
```

#### 4. **views/partials/header.ejs**
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title || 'FreelanceHub' %></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
```

#### 5. **views/partials/navbar.ejs**
```ejs
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container">
    <a class="navbar-brand" href="/">FreelanceHub</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="/gigs">Browse Gigs</a></li>

        <% if (user) { %>
          <% if (user.role === 'freelancer' || user.role === 'both') { %>
            <li class="nav-item"><a class="nav-link" href="/gigs/create">Post a Gig</a></li>
            <li class="nav-item"><a class="nav-link" href="/orders/freelancer">Orders Received</a></li>
          <% } %>

          <% if (user.role === 'client' || user.role === 'both') { %>
            <li class="nav-item"><a class="nav-link" href="/orders/client">My Orders</a></li>
          <% } %>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
              <%= user.username %>
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="/profile">Profile</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="/auth/logout">Logout</a></li>
            </ul>
          </li>
        <% } else { %>
          <li class="nav-item"><a class="nav-link" href="/auth/login">Login</a></li>
          <li class="nav-item"><a class="nav-link" href="/auth/register">Register</a></li>
        <% } %>
      </ul>
    </div>
  </div>
</nav>
```

#### 6. **.env**
```
MONGODB_URI=mongodb://localhost:27017/freelancehub
SESSION_SECRET=your-very-secret-key-change-this
PORT=3000
NODE_ENV=development
```

#### 7. **.gitignore**
```
node_modules/
.env
public/uploads/
*.log
.DS_Store
```

#### 8. **package.json**
```json
{
  "name": "freelancehub",
  "version": "1.0.0",
  "description": "Freelancer marketplace platform",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "ejs": "^3.1.9",
    "express-session": "^1.17.3",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "express-validator": "^7.0.1",
    "dotenv": "^16.0.3",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## Team Collaboration Guidelines

### Division of Work (Suggested for 4-5 members)

#### **Team Member 1: Authentication & User Management**
- User model
- Registration/login pages
- Session management
- Authentication middleware
- User profile

#### **Team Member 2: Gig Management**
- Gig model
- Create gig form and functionality
- Gig listing and detail pages
- Edit/delete gig
- File upload implementation

#### **Team Member 3: Search & Advanced Features**
- Search functionality
- Sorting implementation
- Pagination
- Filtering
- Frontend JavaScript for dynamic features

#### **Team Member 4: Orders & UI/UX**
- Order model
- Order creation and management
- Bootstrap styling throughout
- Error handling
- Responsive design

#### **Team Member 5 (if 5 members): Testing & Deployment**
- Docker setup
- Database seeding
- Testing all features
- Bug fixes
- Video creation assistance
- Documentation

### Communication & Coordination
- Weekly team meetings
- Use GitHub for version control
- Create feature branches
- Code reviews before merging
- Document your code with comments
- Keep team updated on progress

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/authentication

# Work on your feature
git add .
git commit -m "Add user registration"

# Push to GitHub
git push origin feature/authentication

# Create pull request for team review
# After review, merge to main branch
```

---

## Common Pitfalls to Avoid

1. **Not testing file upload restrictions** - Always test max size and file type validation
2. **Forgetting to hash passwords** - Never store plain text passwords
3. **Not protecting routes** - Use authentication middleware on protected routes
4. **Inconsistent validation** - Validate on both client and server side
5. **Not populating referenced data** - Use `.populate()` to get related data
6. **Forgetting to handle errors** - Always have try-catch blocks
7. **Not testing on multiple browsers** - Test early and often
8. **Leaving console.logs** - Remove debugging code before submission
9. **Not seeding enough data** - Need 10+ results for pagination demo
10. **Starting video recording late** - Plan and practice before recording

---

## Assignment Requirements Checklist

### Functional Requirements (20%)

- [ ] **Login requirement**
  - User registration with username, email, password
  - User login functionality
  - Session management

- [ ] **Form requirement**
  - At least one complex form (Post a Gig)
  - 3+ input fields ✓
  - Radio buttons with 4+ options ✓
  - Checkboxes with 4+ options ✓
  - Text area ✓
  - File upload with restrictions ✓

- [ ] **Search requirement**
  - Search functionality that queries database
  - Display results properly

- [ ] **Sorting results**
  - Click column headers to sort dynamically

### Performance / Security (20%)

- [ ] **Sessions**
  - Preserve continuity after login
  - Session configuration

- [ ] **Form validation**
  - Client-side validation (JavaScript)
  - Server-side validation (express-validator)

- [ ] **Browser compatibility**
  - Works on Chrome, Firefox, Edge, Safari

- [ ] **Unauthorized access**
  - Protected routes
  - Middleware for authentication
  - Verify ownership before edit/delete

### Front-end Development (20%)

- [ ] **HTML5**
  - Semantic tags used throughout
  - Proper document structure

- [ ] **CSS3**
  - Custom styling
  - Responsive design

- [ ] **JavaScript**
  - DOM manipulation
  - Event handling
  - Form validation
  - Dynamic sorting

- [ ] **Bootstrap** (Extra credit)
  - Components used throughout
  - Responsive grid system

### Back-end Development (30%)

- [ ] **Database design**
  - 3+ collections (Users, Gigs, Orders)
  - 2+ relationships
  - Proper schema design
  - Populated with adequate data

- [ ] **Node.js and Express**
  - Proper project structure
  - Middleware usage
  - RESTful routing
  - Error handling

- [ ] **REST API**
  - RESTful routes implemented
  - Proper HTTP methods

- [ ] **CRUD Operations**
  - READ (view gigs, orders, users)
  - WRITE (create gig, order, user)
  - UPDATE (edit gig, profile, order status)
  - SEARCH (search gigs)

- [ ] **MongoDB & Mongoose**
  - Models with validation
  - Queries and aggregations
  - Population for relationships

- [ ] **EJS**
  - Templates with partials
  - Dynamic data rendering

### UI / UX Design (10%)

- [ ] **Usability**
  - Intuitive navigation
  - Clear call-to-actions
  - Consistent design

- [ ] **Navigation / Pagination**
  - Easy to navigate
  - Pagination works (10 results per page)

- [ ] **User support to tasks**
  - Clear instructions
  - Helpful error messages

- [ ] **Error handling**
  - Graceful error handling
  - User-friendly messages

### Other Requirements

- [ ] **Context**
  - Clear purpose and identity (Freelancer Marketplace)
  - Not just sample code

- [ ] **Docker**
  - Dockerfile created
  - docker-compose.yml created
  - Application runs in Docker

- [ ] **Meetings**
  - Week 4: Topic approval ✓
  - Week 7: Progress meeting 1
  - Week 10: Progress meeting 2

- [ ] **Submission**
  - GitHub repository
  - 10-15 min demonstration video
  - Peer assessment form
  - Submitted by Week 12

---

## Resources & Learning Materials

### Official Documentation
- [Node.js Docs](https://nodejs.org/en/docs/)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Bootstrap Docs](https://getbootstrap.com/docs/)
- [EJS Docs](https://ejs.co/)

### Tutorials (Recommended)
- [Net Ninja - Node.js Crash Course](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU)
- [Traversy Media - MERN Stack](https://www.youtube.com/watch?v=CvCiNeLnZ00)
- [Web Dev Simplified - Bootstrap 5](https://www.youtube.com/watch?v=Jyvffr3aCp0)

### Tools
- **Code Editor**: VS Code
- **API Testing**: Postman or Thunder Client
- **Screen Recording**: OBS Studio, Loom
- **Version Control**: Git & GitHub
- **Database GUI**: MongoDB Compass

---

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 4 | Setup | Project initialized, MongoDB connected |
| 5-6 | Authentication | User registration/login complete |
| 6-7 | Gigs | Gig creation and management |
| 7 | **MEETING 1** | Demo auth + gigs |
| 8-9 | Search | Search, sort, pagination working |
| 9-10 | Orders | Order system complete |
| 10 | **MEETING 2** | Demo full workflow |
| 10-11 | Polish | UI/UX enhanced, security hardened |
| 11-12 | Deploy | Docker working, video recorded |
| 12 | **SUBMIT** | All deliverables submitted |

---

## Success Tips

1. **Start early** - Don't wait until the last minute
2. **Communicate regularly** - Keep team members updated
3. **Test frequently** - Test after each feature implementation
4. **Commit often** - Make small, frequent commits with clear messages
5. **Document as you go** - Comment your code, keep notes
6. **Ask for help** - Consult instructor during office hours if stuck
7. **Review requirements** - Regularly check against assignment requirements
8. **Practice demo** - Run through demonstration before recording
9. **Backup your work** - Push to GitHub regularly
10. **Stay organized** - Use this plan as a roadmap

---

## Final Notes

This is a comprehensive project that demonstrates your full-stack web development skills. Take it step-by-step, work collaboratively with your team, and don't hesitate to ask for help when needed.

**Remember:**
- Zero tolerance for late submissions
- Acknowledge any GenAI use
- All team members must present in video
- Fill out peer assessment honestly

**Good luck! You've got this! 🚀**

---

*Last Updated: Week 4*
*Project Status: Planning Phase*
