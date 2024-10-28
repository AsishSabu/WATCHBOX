const nodemailer=require('nodemailer');



//--------------create a email sender  for otp-------------

const transporter = nodemailer.createTransport({
  service: "GMAIL",
  auth: {
    user: "ashiasish1858@gmail.com",
    pass: "hwge qqea deur kzux",
  },
})

module.exports= transporter;



