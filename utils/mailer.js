const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey('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');
const buttonStyleString = `    padding: 10px;
background-color: #4ece4e;
border-radius: 3px;
text-decoration: none;
font-size: 17px;
color: #ffffff;
display: block;
max-width: 126px;`

// Send new email
function sendMail(message) {
    sendGridMail.send(message)
}

// Returns email body for password reset email
function getPasswordResetEmail(email, passwordResetLink) {
    const passwordResetEmail = {
        to: email,
        from: 'karolis.strazdas00@gmail.com',
        subject: 'Password reset',
        html: `We received a request restore your password for your Netbots account: ${email}.
               If you didn't ask to change your password, please ignore this email
               <a href='${passwordResetLink}' style='${buttonStyleString}'> Reset password </a>`
    }

    console.log(passwordResetLink)
    console.log(passwordResetEmail)

    return passwordResetEmail
}

module.exports = {
    getPasswordResetEmail,
    sendMail
}