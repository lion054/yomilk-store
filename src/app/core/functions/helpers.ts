const key = 'solutions123#4$%&';

 export function formatDate (inputDate: any): string {
  const date = new Date(inputDate);
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const day = date.getDay();
  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

// export function calculateTimeLeft(dateString: string): string{
//   const date = new Date(dateString);
//   console.log(date);
//
//   console.log(date.toDateString());
//   const diff = date.getTime() - Date.now();
//
//   const days =  Math.ceil(diff / (1000 * 3600 * 24));
//   return days.toString()
// }

interface DecodedToken {
  exp: number;
}



 //Calculate time left
 export function calculateTimeLeftInSeconds(dateString: string): any {
   const date = new Date(dateString);
   const diff = date.getTime() - Date.now();
   const seconds = Math.ceil(diff / 1000);
   return seconds;
 }

 export function convertSecondsToTimeLabel(seconds: number): any {
   const days = Math.floor(seconds / (3600 * 24));
   const hours = Math.floor((seconds % (3600 * 24)) / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);

   if (seconds <= 0) {
     return 0;
   } else if (days > 0) {
     return `${days} day${days > 1 ? "s" : ""}`;
   } else if (hours > 0) {
     return `${hours} hour${hours > 1 ? "s" : ""}`;
   } else {
     return `${minutes} minute${minutes > 1 ? "s" : ""}`;
   }
 }
 //
 // export function isJwtAboutToExpire(jwt: string): boolean {
 //   const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));
 //   const expirationTime = decodedJwt.exp * 1000; // convert expiration time to milliseconds
 //   const currentTime = Date.now();
 //   const timeUntilExpiration = expirationTime - currentTime;
 //   const minutesUntilExpiration = Math.floor(timeUntilExpiration / 1000 / 60); // convert milliseconds to minutes
 //   const expiresSoon = minutesUntilExpiration <= 1; // consider the JWT about to expire if it will expire in 5 minutes or less
 //   return expiresSoon;
 // }

export function isJwtAboutToExpire(jwt: string): boolean {
  try {
    // Decode JWT and parse the payload
    const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));

    // Ensure that the token has an expiration time
    if (!decodedJwt.exp) {
      console.warn("JWT does not contain an 'exp' field.");
      return false; // or throw an error if required
    }

    // Calculate expiration and current times in milliseconds
    const expirationTime = decodedJwt.exp * 1000;
    const currentTime = Date.now();

    // Calculate remaining time until expiration in minutes
    const timeUntilExpiration = expirationTime - currentTime;
    const minutesUntilExpiration = Math.floor(timeUntilExpiration / 1000 / 60);

    // Consider the JWT about to expire if it will expire in 5 minutes or less
    const expiresSoon = minutesUntilExpiration <= 5;
    return expiresSoon;
  } catch (error) {
    console.error("Invalid JWT format:", error);
    return true; // Return false or handle error as necessary
  }
}


export function isExpired(jwt: any): boolean {
  const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));
  const expirationTime = decodedJwt.exp * 1000; // convert expiration time to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;
  const minutesUntilExpiration = Math.floor(timeUntilExpiration / 1000 / 60); // convert milliseconds to minutes
  return minutesUntilExpiration <= 1;
}


 ///Encrypt ID
 export function obfuscate(str: string): string {
   const charCode = str.charCodeAt(0) ^ key.charCodeAt(0);
   const encryptedCharCode = (charCode + 10000).toString(36);
   return encryptedCharCode.padStart(5, '0');
 }

 ///DecryptId
 export function deObfuscate(str: string): string {
   const charCode = parseInt(str, 36) - 10000;
   const decryptedChar = String.fromCharCode(charCode ^ key.charCodeAt(0));
   return decryptedChar;
 }
