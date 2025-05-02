import requests
import os

PUSHCUT_API_KEY = os.environ.get("PUSHCUT_API_KEY")
PUSHCUT_NOTIFICATION_NAME = os.environ.get("PUSHCUT_NOTIFICATION_NAME", "Bin Day Reminder")
API_ROUTE = os.environ.get("API_ROUTE")
PUSHCUT_URL = os.environ.get("PUSHCUT_URL", "https://api.pushcut.io/v1/notifications/Bin Day Reminder")

def lambda_handler(event, context):
    try:
        if not all([PUSHCUT_API_KEY, PUSHCUT_NOTIFICATION_NAME, API_ROUTE, PUSHCUT_URL]):
            return {"error": "Missing required environment variables"}
            
        if not isinstance(API_ROUTE, str):
            return {"error": "API_ROUTE must be a string"}

        response = requests.get(API_ROUTE)
        response.raise_for_status()
        data = response.json()

        days = data.get("days")
        color = data.get("colorName")

        if days == 1:
            message = f"Put out the {color.lower()} bin tonight!"
            pushcut_url = PUSHCUT_URL
            headers = {"Authorization": f"Bearer {PUSHCUT_API_KEY}"}
            payload = {
                "title": "Bin Day Reminder",
                "text": message,
                "notification": {
                    "name": PUSHCUT_NOTIFICATION_NAME
                }
            }
            pushcut_response = requests.post(pushcut_url, json=payload, headers=headers)
            pushcut_response.raise_for_status()
            return {"status": "notification sent", "message": message}

        return {"status": "no action needed", "days": days}
    
    except Exception as e:
        return {"error": str(e)}
