## Backend

The backend is the core of the MarketEye platform. It provides a RESTful API that handles business logic, authentication, data management, and communication between the frontend, the database, and external services.

Built with **Node.js**, **Express.js**, and **MongoDB**, the backend follows a modular architecture to keep the codebase organized, scalable, and easy to maintain.

### Responsibilities

The backend is responsible for:

- Authenticating users and managing access using JWT.
- Managing products, shops, and product listings.
- Validating incoming requests before processing them.
- Enforcing business rules and user permissions.
- Storing and retrieving data from MongoDB.
- Providing data to the frontend through REST API endpoints.
- Integrating with the Gemini API to answer user questions using MarketEye data.

### Architecture

The backend is organized into separate modules, each with a specific responsibility:

| Folder | Responsibility |
|---------|----------------|
| `config/` | Database and application configuration |
| `controllers/` | Handles incoming requests and responses |
| `middleware/` | Authentication, authorization, validation, and error handling |
| `models/` | MongoDB schemas and database models |
| `routes/` | Defines REST API endpoints |
| `services/` | Business logic and external API integrations |
| `utils/` | Shared helper functions |

### Request Flow

Every request follows the same processing flow:

```
Client
   │
   ▼
API Route
   │
   ▼
Middleware
(Authentication & Validation)
   │
   ▼
Controller
   │
   ▼
Service (Business Logic)
   │
   ▼
MongoDB / External APIs
   │
   ▼
JSON Response
```

### Security

The backend implements several security measures:

- JWT-based authentication for protected routes.
- Password hashing using bcrypt.
- Role-based access control for Vendors and Administrators.
- Request validation to prevent invalid or malicious input.
- Environment variables for sensitive configuration.

### Design Principles

The backend was designed with the following goals:

- **Modularity** – Each component has a single responsibility.
- **Scalability** – New features can be added without major changes.
- **Maintainability** – Clear project structure and separation of concerns.
- **Security** – Protected routes and secure password storage.
- **Extensibility** – Easy integration with external services such as AI APIs.