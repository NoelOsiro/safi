# WinjoPro Training Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/noelosiros-projects/v0-mama-safi-project)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## Overview

This is a training platform built with Next.js 13+ and Appwrite for authentication and data storage.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Appwrite instance

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

\`\`\`env
# App
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=your_api_url
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

## Features

- User authentication with Appwrite
- Training modules with progress tracking
- Interactive learning experience
- Admin dashboard for content management

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Appwrite
- **Database**: Appwrite Database

## Deployment

Deploy the example using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-docs) or your preferred hosting provider.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
