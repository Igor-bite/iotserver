import os
import sys
import smtplib
import imghdr
from email.message import EmailMessage
from email.mime.text import MIMEText
import json

with open('./routes/config.json') as f:
    d = json.load(f)
    EMAIL_ADDRESS = d['email']
    EMAIL_PASSWORD = d['pass']

msg = EmailMessage()
msg['Subject'] = 'New device registered'
msg['From'] = EMAIL_ADDRESS
msg['To'] = EMAIL_ADDRESS

msg.set_content(f"""\
<!DOCTYPE html>
<html>
    <body>
        <title></title>
        <h2>New Device Registered</h2>

        <p>Your new device&#39;s token is:</p>

        <p><strong><big><span style="font-size:20px;">{sys.argv[1]}</span></big></strong></p>

        <p>&nbsp;</p>

        <p><em><span style="font-size:11px;">Admin: klyuzhevigor@gmail.com</span></em></p>
    </body>
</html>
""", subtype='html')

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
    smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
    smtp.send_message(msg)

