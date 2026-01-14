# backend/app/utils/email_service.py
# ----------------------------------------------------------
# Email service for sending notifications to admin users
# ----------------------------------------------------------
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from datetime import datetime

# Email configuration from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)

def send_low_stock_notification(recipient_email: str, recipient_name: str, low_stock_items: List[dict]) -> bool:
    """
    Send email notification to admin user about low stock items.
    
    Args:
        recipient_email: Email address of the admin user
        recipient_name: Name of the admin user
        low_stock_items: List of dictionaries containing low stock item information
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not recipient_email:
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_FROM
        msg['To'] = recipient_email
        msg['Subject'] = f"Low Stock Alert - {datetime.now().strftime('%Y-%m-%d')}"
        
        # Create HTML email body
        html_body = f"""
        <html>
          <head></head>
          <body>
            <h2>Low Stock Alert - Daily Notification</h2>
            <p>Dear {recipient_name},</p>
            <p>The following items are currently below their minimum count:</p>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th>Item Name</th>
                  <th>Part Number</th>
                  <th>Current Quantity</th>
                  <th>Minimum Count</th>
                  <th>Unit</th>
                  <th>Test Area</th>
                  <th>Project</th>
                </tr>
              </thead>
              <tbody>
        """
        
        for item in low_stock_items:
            html_body += f"""
                <tr>
                  <td>{item.get('item_name', 'N/A')}</td>
                  <td>{item.get('item_part_number', 'N/A')}</td>
                  <td style="color: red; font-weight: bold;">{item.get('item_current_quantity', 0)}</td>
                  <td>{item.get('item_min_count', 0)}</td>
                  <td>{item.get('item_unit', 'N/A')}</td>
                  <td>{item.get('test_area', 'N/A')}</td>
                  <td>{item.get('project_name', 'N/A')}</td>
                </tr>
            """
        
        html_body += """
              </tbody>
            </table>
            <p>Please take necessary action to restock these items.</p>
            <p>Best regards,<br>MMIS System</p>
          </body>
        </html>
        """
        
        # Create plain text version
        text_body = f"""
Low Stock Alert - Daily Notification

Dear {recipient_name},

The following items are currently below their minimum count:

"""
        for item in low_stock_items:
            text_body += f"""
Item: {item.get('item_name', 'N/A')}
Part Number: {item.get('item_part_number', 'N/A')}
Current Quantity: {item.get('item_current_quantity', 0)} (Minimum: {item.get('item_min_count', 0)})
Unit: {item.get('item_unit', 'N/A')}
Test Area: {item.get('test_area', 'N/A')}
Project: {item.get('project_name', 'N/A')}
---
"""
        
        text_body += "\nPlease take necessary action to restock these items.\n\nBest regards,\nMMIS System"
        
        # Attach both versions
        part1 = MIMEText(text_body, 'plain')
        part2 = MIMEText(html_body, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        if SMTP_USERNAME and SMTP_PASSWORD:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
            return True
        else:
            print(f"[EMAIL SERVICE] Email configuration not set. Would send to {recipient_email}")
            print(f"[EMAIL SERVICE] Low stock items: {len(low_stock_items)}")
            return False
            
    except Exception as e:
        print(f"[EMAIL SERVICE] Error sending email to {recipient_email}: {str(e)}")
        return False

