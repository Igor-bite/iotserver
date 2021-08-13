import os
import smtplib
import imghdr
from email.message import EmailMessage
import json

with open('./routes/config.json') as f:
    d = json.load(f)
    EMAIL_ADDRESS = d['email']
    EMAIL_PASSWORD = d['pass']

msg = EmailMessage()
msg['Subject'] = 'Email from server'
msg['From'] = EMAIL_ADDRESS
msg['To'] = EMAIL_ADDRESS

msg.set_content('Hello! Test of emailing')

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
    smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    smtp.send_message(msg)

