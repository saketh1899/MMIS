# backend/app/utils/scheduler.py
# ----------------------------------------------------------
# Scheduled job service for sending daily low stock notifications
# ----------------------------------------------------------
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import crud
from .email_service import send_low_stock_notification
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def send_daily_low_stock_notifications():
    """
    Scheduled job that runs at the end of each day to send low stock notifications
    to all admin users.
    """
    db: Session = SessionLocal()
    try:
        logger.info(f"[SCHEDULER] Running daily low stock notification job at {datetime.now()}")
        
        # Get all low stock items
        low_stock_items = crud.get_low_stock_items(db)
        
        if not low_stock_items:
            logger.info("[SCHEDULER] No low stock items found. Skipping notifications.")
            return
        
        # Convert items to dictionary format for email
        items_data = []
        for item in low_stock_items:
            items_data.append({
                'item_name': item.item_name,
                'item_part_number': item.item_part_number or 'N/A',
                'item_current_quantity': item.item_current_quantity,
                'item_min_count': item.item_min_count,
                'item_unit': item.item_unit or 'N/A',
                'test_area': item.test_area or 'N/A',
                'project_name': item.project_name or 'N/A'
            })
        
        # Get all admin users with email addresses
        admin_users = crud.get_admin_users(db)
        
        if not admin_users:
            logger.warning("[SCHEDULER] No admin users with email addresses found.")
            return
        
        # Send email to each admin user
        success_count = 0
        for admin in admin_users:
            if admin.employee_email:
                success = send_low_stock_notification(
                    recipient_email=admin.employee_email,
                    recipient_name=admin.employee_name,
                    low_stock_items=items_data
                )
                if success:
                    success_count += 1
                    logger.info(f"[SCHEDULER] Email sent successfully to {admin.employee_email}")
                else:
                    logger.error(f"[SCHEDULER] Failed to send email to {admin.employee_email}")
        
        logger.info(f"[SCHEDULER] Daily notification job completed. Sent {success_count}/{len(admin_users)} emails.")
        
    except Exception as e:
        logger.error(f"[SCHEDULER] Error in daily low stock notification job: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    """
    Start the scheduler with the daily low stock notification job.
    The job runs at 11:59 PM every day.
    """
    if not scheduler.running:
        # Schedule job to run at 11:59 PM every day
        scheduler.add_job(
            send_daily_low_stock_notifications,
            trigger=CronTrigger(hour=23, minute=59),
            id='daily_low_stock_notification',
            name='Daily Low Stock Notification',
            replace_existing=True
        )
        scheduler.start()
        logger.info("[SCHEDULER] Scheduler started. Daily low stock notifications scheduled for 11:59 PM.")
    else:
        logger.warning("[SCHEDULER] Scheduler is already running.")

def stop_scheduler():
    """Stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("[SCHEDULER] Scheduler stopped.")

