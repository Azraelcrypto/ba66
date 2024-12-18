// src/result-page.js or your result-page.html script
const getAMLReport = async (token) => {
    const response = await fetch(`https://check.fastaml.com/scan?token=${token}`);
    const report = await response.json();
    return report;
  };
  
  document.addEventListener('DOMContentLoaded', async () => {
    const token = 'USDT_TRON'; // Replace with actual token if needed
    const report = await getAMLReport(token);
    console.log(report); // Display or handle the report data as needed
  
    // Example of displaying the report on the page
    document.getElementById('amlReport').innerText = JSON.stringify(report, null, 2);
  });
  