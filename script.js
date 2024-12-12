document.getElementById("calculate-btn").addEventListener("click", calculate);

// function calculate() {
//     const sigmaVVDb = parseFloat(document.getElementById("sigma_vv").value);
//     const sigmaVHDb = parseFloat(document.getElementById("sigma_vh").value);
//     const thetaDeg = parseFloat(document.getElementById("theta").value);

//     if (isNaN(sigmaVVDb) || isNaN(sigmaVHDb) || isNaN(thetaDeg)) {
//         alert("Please fill in all fields with valid values!");
//         return;
//     }

//     // Convert inputs
//     const sigmaVV = Math.pow(10, sigmaVVDb / 10);
//     const sigmaVH = Math.pow(10, sigmaVHDb / 10);
//     const theta = (Math.PI / 180) * thetaDeg;
//     const k = (2 * Math.PI) / 0.056;

//     // Perform calculations (simplified for demo)
//     const A = 0.1, B = 1.0, C = 2.0, E = 0.05, F = 0.7;

//     const epsilonOpt = 15; // Mock optimized value
//     const sOpt = 0.05; // Mock optimized value
//     const modelSigmaVV = (A / Math.cos(theta)) * Math.pow((epsilonOpt - 1) / (epsilonOpt + 1), B) * Math.exp(-C * Math.cos(theta) * k * sOpt);
//     const modelSigmaVH = E * Math.pow(modelSigmaVV ** 2, F);

//     const resultsDiv = document.getElementById("results");
//     resultsDiv.innerHTML = `
//         <h2>Results</h2>
//         <p><strong>Optimized Dielectric Constant (epsilon):</strong> ${epsilonOpt.toFixed(2)}</p>
//         <p><strong>Optimized Surface Roughness (s):</strong> ${sOpt.toFixed(2)} meters</p>
//         <p><strong>Modeled Sigma VV:</strong> ${modelSigmaVV.toExponential(2)}</p>
//         <p><strong>Modeled Sigma VH:</strong> ${modelSigmaVH.toExponential(2)}</p>
//     `;

//     plotData([sigmaVV, sigmaVH], [modelSigmaVV, modelSigmaVH]);
// }

function plotData(observed, modeled) {
    const canvas = document.getElementById("plot");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const labels = ["Sigma VV", "Sigma VH"];
    const barWidth = 80;
    const colors = ["blue", "orange"];

    observed.forEach((value, i) => {
        const x = 100 + i * 200;
        const y = 300 - value * 100;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, barWidth, 300 - y);
        ctx.fillText(labels[i], x + 10, 320);
    });

    modeled.forEach((value, i) => {
        const x = 100 + i * 200 + 100;
         const y = 300 - value * 100;
         ctx.fillStyle = "green";
         ctx.fillRect(x, y, barWidth, 300 - y);
         ctx.fillText(`Modeled ${labels[i]}`, x + 10, 320);
     });
 }



// Constants for the model parameters
const A = 0.1, B = 1.0, C = 2.0, E = 0.05, F = 0.7;

// Function to calculate and display results
function calculate() {
    try {
        // Example user inputs (replace with actual user inputs)
        // const sigmaVv = parseFloat(prompt("Enter sigmaVv (example: 1.2):", "1.2"));
    const sigmaVv = parseFloat(document.getElementById("sigma_vv").value);
    const sigmaVh= parseFloat(document.getElementById("sigma_vh").value);
    const theta = parseFloat(document.getElementById("theta").value);

        if (isNaN(sigmaVv) || isNaN(sigmaVh) || isNaN(theta)) {
            alert("Please fill in all fields with valid values!");
            return;
}

        // Convert inputs
        const sigmaVvLinear = Math.pow(10, sigmaVv / 10);
        const sigmaVhLinear = Math.pow(10, sigmaVh / 10);
        const thetaRad = (Math.PI / 180) * theta;
        const k = (2 * Math.PI) / 0.056;

        // Objective function (simplified for this example)
        const epsilon = 30; // Example value for dielectric constant
        const s = 0.05; // Example value for surface roughness

        // Modeled values
        const modelSigmaVv = (A / Math.cos(thetaRad)) * Math.pow((epsilon - 1) / (epsilon + 1), B) * Math.exp(-C * Math.cos(thetaRad) * k * s);
        const modelSigmaVh = E * Math.pow(modelSigmaVv, 2) * F;

        const epsilonOpt = 15; // Mock optimized value


        // Estimated soil moisture (Topp equation example)
        const soilMoisture = 4.3e-6 * Math.pow(epsilon, 3) - 5.5e-4 * Math.pow(epsilon, 2) + 2.92e-2 * epsilon - 5.3e-2;

        // Estimated soil roughness
        const soilRoughness = 0.5 * (sigmaVv / sigmaVh);

        // Display results
        
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
           <p><strong>Optimized Dielectric Constant (epsilon):</strong> ${epsilonOpt.toFixed(2)}</p>
           <p>Estimated Soil Moisture: ${soilMoisture.toFixed(3)} or ${(soilMoisture * 100).toFixed(1)}% </p>
           <p>Estimated Soil Roughness: ${soilRoughness.toFixed(2)} meters </p>
           <p>Modeled sigma_vv: ${modelSigmaVv.toExponential(2)}</p>
           <p>Modeled sigma_vh: ${modelSigmaVh.toExponential(2)}</p>
            `
        ;

        // Plotting
        // createChart([sigmaVvLinear], [sigmaVhLinear], modelSigmaVv, modelSigmaVh);
         plotData([sigmaVvLinear, sigmaVhLinear], [modelSigmaVv, modelSigmaVh]);

    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

// Function to create a bar chart using Chart.js
function createChart(sigmaVv, sigmaVh, modelSigmaVv, modelSigmaVh) {
        const canvas = document.getElementById("plot");

    const ctx = document.getElementById('chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['sigma_vv', 'sigma_vh'],
            datasets: [
                {
                    label: 'Observed',
                    data: [sigmaVv[0], sigmaVh[0]],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                    label: 'Modeled',
                    data: [modelSigmaVv, modelSigmaVh],
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Modeled Backscatter Coefficients',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// HTML structure for rendering the chart
//const htmlContent = `
//<div>
 //   <canvas id="chart" width="800" height="400"></canvas>
//</div>
//<button onclick="calculate()">Run Analysis</button>
//`;

// Append the HTML content to the body
//document.body.innerHTML = htmlContent;
