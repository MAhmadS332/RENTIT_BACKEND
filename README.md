# Rent It: an Airbnb Inspired Web App

This project integrates a React-based frontend with a Node.js and Express.js backend to provide an Airbnb-inspired platform. It allows users to view property listings, navigate detailed pages for each property, book property.

## Features

1. **Backend**:

   - Built with Node.js and Express.js.
   - Serves static JSON data for property listings.
   - Includes API endpoints for fetching listings and creating bookings.

2. **Frontend**:

   - Developed using React with Vite.
   - Implements `react-router-dom` for navigation between pages.
   - Includes pages for:
     - Homepage (`/`)
     - Listing Details (`/listings/:id`)
     - Booking Page (`/book/:id`)

3. **Routing and Navigation**:

   - Headers:
     - `Authorization: "Bearer <token>"`

   - Backend routes:

     - Listing Routes:

       - `GET /api/listings/`: Fetch all property listings.
       - `GET /api/listings/:id`: Fetch details of a specific listing.
       - `GET /api/listings/search?query:<location>`: Fetch all listings with specific location.

       - Secure Routes:
         - `GET /api/listings/user/:id` : Get all listings of a user.
         - `POST /api/listings/`: Add a new listing.
           - `body: { title, location, type, info, pricePerNight, rating }`
         - `DELETE /api/listings/:id`: Remove an existing listing.
         - `DELETE /api/listings/admin/:id`: Remove an existing listing by admin.

     - Booking Routes

       - `GET /api/bookings/`: Fetch all bookings.

       - Secure Routes
       - `GET /api/bookings/:id`: Fetch bookings of a user.
         - `POST /api/bookings/`: Submit a booking.
           - `body: { listingId, name, email, phone, checkIn, checkOut }`
         - `DELETE /api/bookings/:id`: Remove an existing booking.
         - `DELETE /api/bookings/admin/:id`: Remove an existing booking by admin.

     - Authentication Routes
       - `POST /api/auth/login`: Submit Login
         - `body: { email, password }`
       - `POST /api/auth/register`: Submit Signup
         - `body: { avatar, name, email, password, role }`

   - Frontend routes:
    
    #### 1. Routes for Logged-in Users (Host or Guest)

    - `/` : Renders the home page for logged-in users.  
    - `/listing/add` : Page to add a new listing.  
    - `/book/:id` : Allows the user to book a listing with the given ID.  
      - Parameters:  
        - `id`: ID of the listing to book.  
    - `/bookings/:userId` : Displays all bookings made by the user with the given user ID.  
      - Parameters:  
        - `userId`: ID of the user.  
    - `/listings/user/:userId` : Shows all listings created by the user with the given user ID.  
      - Parameters:  
        - `userId`: ID of the user.  
    - `/listings/:id` : Displays details for a specific listing with the given ID.  
      - Parameters:  
        - `id`: ID of the listing.  
    - `*` : Renders an error page for unmatched routes.  

    ---

    #### 2. Routes for Admin Users

    - `/` : Renders the admin-specific home page.  
    - `/listing/add` : Page for adding a new listing.  
    - `/book/:id` : Allows the admin to book a listing with the given ID.  
      - Parameters:  
        - `id`: ID of the listing to book.  
    - `/admin/bookings/` : Shows all bookings in the system.  
    - `/admin/listings/` : Displays all listings in the system.  
    - `/listings/:id` : Displays details for a specific listing with the given ID.  
      - Parameters:  
        - `id`: ID of the listing.  
    - `*` : Renders an error page for unmatched routes.  

    ---

    #### 3. Routes for Not Logged-in Users

    - `/` : Renders the home page for non-logged-in users.  
    - `/listings/:id` : Displays details for a specific listing with the given ID.  
      - Parameters:  
        - `id`: ID of the listing.  
    - `/listing/add` : Redirects to the login page to add a listing.  
    - `/auth/register` : Displays the signup page.  
    - `/auth/login` : Displays the login page.  
    - `*` : Renders an error page for unmatched routes.  


   **Schemas**:

   - User:

   ```javascript
   {
     avatar: { type: String, required: true },
     name: { type: String, required: true },
     email: { type: String, required: true },
     password: { type: String, required: true },
     role: { type: String, required: true },
     bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
     listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
   };
   ```

      - `Avatar` can have values `"1"` ,`"2"` ,`"3"` ,`"4"` ,`"5"`. These values corresponds to ${Avatar}.jpg in the Frontend.
      - `role` can be either `"host"` or `"guest"`

   - Listing:

   ```javascript
   {
     img: { type: String, required: true },
     title: { type: String, required: true },
     location: { type: String, required: true },
     type: { type: String, required: true },
     info: { guests: Number, bedrooms: Number, bathrooms: Number },
     pricePerNight: { type: String, required: true },
     rating: { type: String, required: true },
     creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
     }
   ```

   - Booking:

   ```javascript
   {
     listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
     name: { type: String, required: true },
     email: { type: String, required: true },
     phone: { type: String, required: true },
     checkIn: { type: Date, required: true },
     checkOut: { type: Date, required: true },
     bookingUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     }
   ```

  **Sample Ids**: 

  - Admin Id
  ```javascript
  {
    email: 'admin@gmail.com',
    password: '11223344'
  }
  ```

  *Sample Ids*:
  - Host 
  ```javascript
  {
    email: 'ahmad@gmail.com',
    password: '11223344'
  }
  ```
  - Guest
  ```javascript
  {
    email: 'ahmad1@gmail.com',
    password: '11223344'
  }
  ```

## Instructions for Running the Project

### Frontend

1. Navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:5173` (default Vite port).

### Backend

1. Navigate to the backend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:

   - For Development

   ```bash
   npm run dev
   ```

   - For Production

   ```bash
   npm start
   ```

4. The API will be available at `http://localhost:3000`.

## Requirements

- Node.js (v16 or higher recommended)
- npm (v8 or higher recommended)
