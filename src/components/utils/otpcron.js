// const cron = require('node-cron');
// const User = require('../../components/user/model/users'); 

// const initOtpCleanupTask = () => {
//   cron.schedule('* * * * *', async () => {
//     try {
//       const result = await User.updateMany(
//         { 
//           otpExpires: { $lt: new Date() }, 
//           otp: { $ne: null } 
//         },
//         { 
//           $set: { otp: null, otpExpires: null } 
//         }
//       );

//       if (result.modifiedCount > 0) {
//         console.log(`[Cron] Cleaned up ${result.modifiedCount} expired OTPs.`);
//       }
//     } catch (err) {
//       console.error("[Cron Error] OTP Cleanup failed:", err);
//     }
//   });
// };

// module.exports = initOtpCleanupTask;
