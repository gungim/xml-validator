# XML Validator Tool

A powerful web-based tool for defining validation rules and validating XML files against them. Built with Next.js, Prisma, and Tailwind CSS.

## Features

### 🏗️ Workspace & Project Management

- Organize your work into **Workspaces**.
- Create multiple **Projects** within workspaces to manage different sets of validation rules.

### 📝 Rule Management

Define complex validation logic for your XML structures:

- **Data Types:** Support for String, Number, Boolean, Object, and Array.
- **Conditions:**
  - **String:** Regex pattern, min/max length, allow empty.
  - **Number:** Min/max value range.
- **Global Rules:** Create reusable rules (like "Email" or "Phone Number") that can be applied across multiple projects.
- **Nested Rules:** Define complex hierarchical structures with parent/child relationships.

### 🚀 Smart Import

- **Import from XML:** Automatically generate validation rules by pasting an XML sample.
- **Interactive Editing:** Fine-tune conditions and required status directly during import.
- **Parent Selection:** Import rules directly under an existing object or array in your schema.

### ✅ Validation Testing

- **Test Sandbox:** Validate XML content directly in the browser against your defined rules.
- **Real-time Feedback:** Get immediate error reporting with precise location and details.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Create a .env file with your database URL
   cp .env.example .env

   # Run migrations
   npx prisma migrate dev
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [https://xml-validator-gamma.vercel.app/workspaces](https://xml-validator-gamma.vercel.app/workspaces) to start defining rules!
