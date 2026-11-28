# iTeach Backend API

RESTful backend API for the iTeach: University Peer-Tutor Scheduling & Management System, built with NestJS, TypeORM, and MySQL. It supports JWT authentication, role-based access control (`student`, `tutor`, `admin`), subject management, and tutoring session scheduling.

## Tech Stack

- **Runtime & Framework:** Node.js, NestJS (TypeScript)
- **ORM & Database:** TypeORM, MySQL
- **Auth & Security:** `@nestjs/jwt`, `passport-jwt`, `bcrypt`
- **Validation:** `class-validator`, `class-transformer`

## Running Locally

1. **Install dependencies**
   ```bash
   npm install
   
## Creating iTeach Database
CREATE DATABASE IF NOT EXISTS iteach;

## To start the server on VSCode
npm run start:dev

The API runs at http://localhost:3000
