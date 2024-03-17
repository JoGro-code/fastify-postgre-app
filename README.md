# Fastify CRUD API Project

This project is a simple yet powerful implementation of a CRUD (Create, Read, Update, Delete) API using Fastify with TypeScript. It showcases best practices for building scalable and maintainable applications.

## Features

- **Fastify**: High performance and low overhead framework.
- **TypeScript**: Strong typing for safer code.
- **Sequelize**: ORM for database interactions, with direct SQL execution capabilities.
- **Hot Reload**: Enhanced development experience with nodemon.

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- PostgreSQL database

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/fastify-crud-api.git
   ```

2. Install NPM packages:

   ```sh
   cd fastify-crud-api
   npm install
   ```

3. Copy .env.example to .env and update the environment variables according to your setup:

   ```sh
   cp .env.example .env
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

### Usage

Access the API endpoints at http://localhost:3000. The following endpoints are available:

- POST /users - Create a new user
- GET /users - Retrieve all users
- GET /users?id={userId} - Retrieve a user by ID
- PUT /users - Update a user by ID
- DELETE /users - Delete a user by ID

### Adding New Features

#### Adding New Routes

1. Open src/routes.ts.

2. Define a new route and its handler:

   ```TS
   fastify.get('/new-route', async (request, reply) => {
   // Handler logic here
   });
   ```

3. Register the route in app.ts by importing and using it:

   ```TS
   import newRoute from './routes/newRoute';
   server.register(newRoute);
   ```

#### Adding New Models

1. Create a new model file in src/models, e.g., newModel.ts.

2. Define the model using Sequelize:

   ```TS
   import { DataTypes, Model } from 'sequelize';
   import sequelize from '../config/database';

   class NewModel extends Model {
     // Model attributes here
   }

   NewModel.init({
     // Attribute definitions here
   }, {
     sequelize,
     modelName: 'NewModel'
   });

   export default NewModel;
   ```

#### Adding New Controllers

1. Create a new controller file in src/controllers, e.g., newController.ts.

2. Implement the controller logic:

```TS
import { FastifyRequest, FastifyReply } from 'fastify';
import NewModel from '../models/newModel';

export const newControllerMethod = async (request: FastifyRequest, reply: FastifyReply) => {
  // Controller logic here
};
```

3. Use the controller in your routes.

#### Contributing

Contributions are welcome! Please feel free to submit a pull request.

#### License

Distributed under the MIT License. See LICENSE for more information.
