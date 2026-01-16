# CareFreelancer

A mock freelance marketplace web application where clients can find talented freelancers and freelancers can showcase their services. Built as part of the CCS2210 Web Programming course at the University of York.

## About the Project

CareFreelancer connects freelancers with clients looking for services. Freelancers create gigs describing what they offer, set their prices, and wait for orders. Clients browse available gigs, place orders, and communicate their requirements. The platform handles the workflow from order placement through completion.

## Features

### For Freelancers
- Create and manage service listings (gigs)
- Upload images to showcase work
- Receive and process client orders
- Track order status from pending to completed

### For Clients
- Browse and search available gigs
- Filter by category and sort results
- Place orders with custom requirements
- Track order progress and history

### General
- User registration with email verification
- Password reset functionality
- Profile management with image uploads
- Cookie consent for GDPR compliance
- Responsive design that works on mobile and desktop

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **View Engine**: EJS templates
- **Styling**: Bootstrap 5 with custom CSS
- **Authentication**: Express sessions with bcrypt password hashing
- **File Uploads**: Multer middleware
- **Security**: CSRF protection, rate limiting, input validation

## Getting Started

### Prerequisites

You need Node.js and MongoDB installed on your machine. Alternatively, you can use Docker.

### Local Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/carefreelancer
   SESSION_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=development
   ```
4. Start the server:
   ```
   node app.js
   ```
5. Open your browser and go to `http://localhost:3000`

### Using Docker

If you have Docker installed, you can run the entire application with one command:

```
docker-compose up --build
```

This starts both the Node.js application and MongoDB database. Access the site at `http://localhost:3000`.

To stop the containers:
```
docker-compose down
```

### Seeding the Database

To populate the database with sample data for testing:

```
node seed.js
```

Or if using Docker:
```
docker exec carefreelancer-app node seed.js
```

## Project Structure

```
CareFreelancer/
├── config/          Database configuration
├── middleware/      Authentication, CSRF, error handling
├── models/          MongoDB schemas (User, Gig, Order)
├── public/          Static files (CSS, JavaScript, uploads)
├── routes/          Express route handlers
├── services/        Email service
├── utils/           Helper functions
├── views/           EJS templates
├── app.js           Application entry point
└── seed.js          Database seeding script
```

## API Routes

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Process login
- `GET /auth/register` - Registration page
- `POST /auth/register` - Process registration
- `GET /auth/logout` - Log out user

### Gigs
- `GET /gigs` - Browse all gigs
- `GET /gigs/search` - Search with filters
- `GET /gigs/my-gigs` - View own gigs
- `GET /gigs/:id` - Gig details
- `POST /gigs` - Create new gig
- `PUT /gigs/:id` - Update gig
- `DELETE /gigs/:id` - Delete gig

### Orders
- `GET /orders/client` - Client order history
- `GET /orders/freelancer` - Freelancer received orders
- `POST /orders` - Place new order
- `PATCH /orders/:id` - Update order status

### Profile
- `GET /profile` - View profile
- `POST /profile/edit` - Update profile

## Contributors

This project was developed by:

- Yiota K
- Anargyros P
- Stamatis K
- Konstantinos P

## Academic Context

This project was created for a coursework in CCS2210 Web Programming at the University of York's European Campus. It demonstrates practical implementation of full-stack web development concepts including server-side rendering, database operations, user authentication, file handling, and security best practices.

## License

This project is for educational purposes only, as part of a university's coursework.
