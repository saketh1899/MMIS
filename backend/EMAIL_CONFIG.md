# Email Notification Configuration Guide

## Overview
The MMIS system now includes automatic email notifications for admin users when items fall below their minimum count. Notifications are sent daily at 11:59 PM.

## Configuration

### Environment Variables
Set the following environment variables to configure email notifications:

```bash
# SMTP Server Configuration
SMTP_SERVER=smtp.gmail.com          # Your SMTP server address
SMTP_PORT=587                       # SMTP port (usually 587 for TLS)
SMTP_USERNAME=your-email@gmail.com  # Your email address
SMTP_PASSWORD=your-app-password     # Your email password or app-specific password
EMAIL_FROM=your-email@gmail.com     # Sender email address (defaults to SMTP_USERNAME)
```

### Gmail Configuration Example
If using Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated app password as `SMTP_PASSWORD`

### Setting Environment Variables

#### Windows (PowerShell)
```powershell
$env:SMTP_SERVER="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="your-email@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
$env:EMAIL_FROM="your-email@gmail.com"
```

#### Linux/Mac
```bash
export SMTP_SERVER=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export EMAIL_FROM=your-email@gmail.com
```

#### Using .env file (Recommended)
Create a `.env` file in the `backend` directory:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

Then install `python-dotenv` and load it in your application:
```bash
pip install python-dotenv
```

## Setting Up Admin User Emails

Admin users need to have email addresses in the database. You can update employee records to include email addresses:

```sql
UPDATE employees 
SET employee_email = 'admin@example.com' 
WHERE employee_access_level = 'admin' AND employee_id = 1;
```

Or use the employee management API to update employee information.

## Testing

### Manual Trigger
You can manually trigger email notifications using the API endpoint:

```bash
POST /alerts/send-notifications
```

This will immediately send low stock notifications to all admin users with email addresses.

### Scheduled Job
The scheduled job runs automatically at 11:59 PM every day. The scheduler starts automatically when the FastAPI application starts.

## Email Content

The email notification includes:
- A list of all items below minimum count
- Item details: name, part number, current quantity, minimum count, unit, test area, and project
- Formatted as both HTML and plain text

## Troubleshooting

1. **Emails not sending**: Check that all environment variables are set correctly
2. **Authentication errors**: Verify SMTP credentials and ensure app passwords are used for Gmail
3. **No admin users found**: Ensure admin users have email addresses in the database
4. **No low stock items**: The system only sends emails when there are items below minimum count

## Logs

Check application logs for scheduler and email service messages:
- `[SCHEDULER]` - Scheduler-related messages
- `[EMAIL SERVICE]` - Email sending status

