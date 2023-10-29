const transporter=require('../../config/email')


//----------------function to generate otp--------------------
// function generateNumericOTP() {
//     const digits = '0123456789';
//     let otp = '';
    
//     for (let i = 0; i < 4; i++) {
//       const randomIndex = Math.floor(Math.random() * digits.length);
//       otp += digits.charAt(randomIndex);
//     }
  
//     return otp;
//   }

function generateNumericOTP() {
    const min = 1000;
    const max = 9999;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp;
  }
  
  //----------chechking code-------------------
//   const otp = generateNumericOTP();
//   console.log('Generated Numeric OTP:', otp);

//----------send otp function--------------------------------   

 function sendOtp(email,otp,name){

    const message = `

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                background-color: #000000;
                color: #ffffff;
                padding: 10px;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>OTP Verification</h1>
            </div>
            <div class="content">
                <p>Dear ${name},</p>
                <p>Your OTP for verifying your email is:</p>
                <h2 style="text-align: center; background-color: #000000; color: #ffffff; padding: 10px; border-radius: 5px;">
                    ${otp}<!-- Replace this with your actual OTP -->
                </h2>
                <p>Please enter this OTP to complete the verification process.</p>
            </div>
        </div>
    </body>
    </html>
    
    
    `;
    const mailOptions={
        from:`ashiasish@gmail.com`,
        to:email,
        subject:'Your OTP verification code',
        html:message

    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending OTP:', error);
        } else {
            
          console.log('OTP sent:', info.response);
        }
      });

 }

//-----------------testing------------------------

//  const recipientEmail = 'ashiasish1858@gmail.com';
// const otp = generateNumericOTP();
// const name ="bilby"// Replace with the generated OTP



module.exports = {sendOtp,
    generateNumericOTP};

  