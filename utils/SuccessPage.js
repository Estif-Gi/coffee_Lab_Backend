export const successPage = (email) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #a0522d;
        }

        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        h1 {
            color: #6b3a2a;
            font-size: 1.8rem;
            margin-bottom: 12px;
        }

        p {
            color: #8b6347;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 8px;
        }

        .email {
            display: inline-block;
            background-color: #ede0d4;
            color: #6b3a2a;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 12px 0 24px;
            font-size: 0.95rem;
        }

        .btn {
            display: inline-block;
            background-color: #a0522d;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
            transition: background-color 0.2s;
        }

        .btn:hover { background-color: #7a3e20; }

        .footer {
            margin-top: 32px;
            color: #b08870;
            font-size: 0.82rem;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">☕</div>
        <h1>You're Verified!</h1>
        <p>Your email address has been successfully verified.</p>
        <span class="email">${email}</span>
        <p>You can now log in and start exploring Coffee Lab.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Go to Login</a>
        <div class="footer">© ${new Date().getFullYear()} Coffee Lab. All rights reserved.</div>
    </div>
</body>
</html>`;

export const alreadyVerifiedPage = (email) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Already Verified - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #c8956c;
        }

        .icon { font-size: 64px; margin-bottom: 20px; }

        h1 { color: #6b3a2a; font-size: 1.8rem; margin-bottom: 12px; }

        p { color: #8b6347; font-size: 1rem; line-height: 1.6; margin-bottom: 8px; }

        .email {
            display: inline-block;
            background-color: #ede0d4;
            color: #6b3a2a;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 12px 0 24px;
            font-size: 0.95rem;
        }

        .btn {
            display: inline-block;
            background-color: #a0522d;
            color: #fff;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
        }

        .btn:hover { background-color: #7a3e20; }

        .footer { margin-top: 32px; color: #b08870; font-size: 0.82rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>Already Verified</h1>
        <p>This account is already verified.</p>
        <span class="email">${email}</span>
        <p>You can go ahead and log in.</p>
        <br/>
        <a href="${process.env.FRONTEND_URL || '#'}" class="btn">Go to Login</a>
        <div class="footer">© ${new Date().getFullYear()} Coffee Lab. All rights reserved.</div>
    </div>
</body>
</html>`;

export const errorPage = (message) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Failed - Coffee Lab</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5ebe0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card {
            background-color: #fff8f2;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 460px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(139, 90, 43, 0.12);
            border-top: 5px solid #c0392b;`
