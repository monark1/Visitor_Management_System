# Visitor Management System (VMS) Pro

A comprehensive visitor management system built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **User Authentication** - Role-based access (Admin, Employee, Guard)
- **Visitor Registration** - Photo capture, contact details, purpose tracking
- **Pre-Approval System** - Schedule visitors and send QR codes via email
- **Real-time Dashboard** - Live statistics and visitor tracking
- **QR Code Generation** - Secure, time-bound visitor passes
- **Email Integration** - Professional email templates with QR attachments
- **Dark/Light Theme** - Modern UI with theme switching

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Email Service:** Resend API
- **QR Generation:** qrcode library
- **Deployment:** Netlify

## 📧 Email Integration Setup

### 1. Resend API Setup (Recommended)

1. **Sign up for Resend:**
   - Go to [resend.com](https://resend.com)
   - Create a free account (10,000 emails/month)
   - Verify your domain or use their test domain

2. **Get API Key:**
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to Supabase:**
   - Go to your Supabase project
   - Navigate to Settings > Edge Functions
   - Add environment variable: `RESEND_API_KEY=your_api_key_here`

### 2. Alternative Email Services

#### SendGrid Setup:
```bash
# Environment variable needed:
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### Mailgun Setup:
```bash
# Environment variables needed:
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

#### Gmail SMTP Setup:
```bash
# Environment variables needed:
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

## 🗄️ Database Setup

The application uses Supabase with the following tables:

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- role (enum: admin, employee, guard)
- department (text)
- auth_user_id (uuid, foreign key to auth.users)
```

### Visitors Table
```sql
- id (uuid, primary key)
- full_name (text)
- contact_number (text)
- email (text)
- purpose (text)
- host_employee_id (uuid, foreign key)
- company_name (text, optional)
- photo_url (text)
- badge_number (text, unique)
- status (enum: pending, approved, rejected, checked-in, checked-out)
```

### Pre-Approvals Table
```sql
- id (uuid, primary key)
- visitor_name (text)
- visitor_email (text)
- visitor_phone (text)
- purpose (text)
- scheduled_date (date)
- start_time (time)
- end_time (time)
- host_employee_id (uuid, foreign key)
- qr_code (text)
- qr_sent (boolean)
- qr_sent_status (enum: not-sent, sending, sent, failed)
```

## 🔧 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd visitor-management-system
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Run the database migrations in `supabase/migrations/`
3. Set up Row Level Security policies
4. Get your project URL and anon key

### 3. Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Email Service Setup
Choose one of the email services above and configure the environment variables in Supabase Edge Functions.

### 5. Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the email function
supabase functions deploy send-qr-email
```

### 6. Run the Application
```bash
npm run dev
```

## 👥 Default Users

After setup, you can login with these demo accounts:

- **Admin:** admin@company.com / admin123
- **Employee:** john@company.com / employee123
- **Guard:** guard@company.com / guard123

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** for different user types
- **JWT authentication** with Supabase Auth
- **QR code digital signatures** to prevent tampering
- **Time-bound QR codes** that expire automatically
- **Input validation** and sanitization

## 📱 Features by Role

### Admin
- View all visitors and statistics
- Manage user accounts and settings
- Access to all system features
- Export visitor data

### Employee
- Create pre-approvals for visitors
- Approve/reject visitor requests
- Send QR codes via email
- View personal visitor history

### Security Guard
- Register walk-in visitors
- Capture visitor photos
- Check visitor status
- Manage visitor check-in/out

## 🎨 UI Features

- **Responsive design** for all screen sizes
- **Dark/Light theme** with system preference detection
- **Real-time updates** with Supabase subscriptions
- **Professional email templates** with company branding
- **Interactive dashboard** with live statistics
- **Modern animations** and micro-interactions

## 📧 Email Template Features

- **Professional HTML design** with gradients and styling
- **Embedded QR code images** (300x300px, high quality)
- **Complete visit details** in organized sections
- **Security instructions** and arrival guidelines
- **Responsive design** for mobile email clients
- **Company branding** with customizable colors

## 🚀 Deployment

The application is deployed on Netlify and can be accessed at:
https://thunderous-rabanadas-8a0f33.netlify.app

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify Supabase connection and API keys
3. Ensure email service is properly configured
4. Check Row Level Security policies

## 🔄 Future Enhancements

- **Mobile app** for security guards
- **Visitor self-registration** kiosk mode
- **Advanced analytics** and reporting
- **Integration with access control systems**
- **Visitor photo storage** with Supabase Storage
- **Real-time notifications** with push notifications
- **Multi-language support**
- **Visitor feedback system**