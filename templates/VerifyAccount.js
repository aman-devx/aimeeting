const { AppUrl } = require("../utils/constants");

const verifyAccount = (token) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Verify Account - I Like File</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color:#f4f6f8; margin:0; padding:0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f6f8">
        <tr>
            <td align="center" style="padding: 40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                <td align="center" bgcolor="#163856" style="padding: 30px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                    I Like File
                    </h1>
                </td>
                </tr>

                <!-- Body -->
                <tr>
                <td style="padding: 30px; color:#333333; font-size:16px; line-height:1.5;">
                    <p style="margin: 0 0 15px 0;">Hello,</p>
                    <p style="margin: 0 0 15px 0;">
                    Thanks for signing up with <strong>I Like File</strong>! Please confirm your email address by clicking the button below:
                    </p>
                    <p style="text-align: center; margin: 30px 0;">
                    <a href="${AppUrl}/verifyaccount/${token}" 
                        style="background-color:#163856; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:600; display:inline-block;">
                        Verify Account
                    </a>
                    </p>
                    
                    <!-- Fallback link -->
                    <p style="margin: 20px 0 15px 0; font-size:14px; color:#555;">
                        If the button above doesn’t work, copy and paste this link into your browser:<br />
                        <a href="${AppUrl}/verifyaccount/${token}" style="color:#163856; word-break:break-all;">${AppUrl}/verifyaccount/${token}</a>
                    </p>

                    <p style="margin: 0 0 15px 0;">
                    If you didn’t create this account, you can safely ignore this email. This verification link will expire in <strong>24 hours</strong>.
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td bgcolor="#f4f6f8" style="padding: 20px; text-align:center; font-size: 13px; color:#777;">
                    © 2025 I Like File. All rights reserved.<br />
                    This is an automated message, please do not reply.
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
    </body>
    </html>
    `;
};


module.exports = { verifyAccount };