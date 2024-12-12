document.getElementById("calculate-btn").addEventListener("click", calculate);

function calculate() {
    const sigmaVVDb = parseFloat(document.getElementById("sigma_vv").value);
    const sigmaVHDb = parseFloat(document.getElementById("sigma_vh").value);
    const thetaDeg = parseFloat(document.getElementById("theta").value);

    if (isNaN(sigmaVVDb) || isNaN(sigmaVHDb) || isNaN(thetaDeg)) {
        alert("Please fill in all fields with valid values!");
        return;
    }

    // Convert inputs
    const sigmaVV = Math.pow(10, sigmaVVDb / 10);
    const sigmaVH = Math.pow(10, sigmaVHDb / 10);
    const theta = (Math.PI / 180) * thetaDeg;
    const k = (2 * Math.PI) / 0.056;

    // Perform calculations (simplified for demo)
    const A = 0.1, B = 1.0, C = 2.0, E = 0.05, F = 0.7;

    const epsilonOpt = 15; // Mock optimized value
    const sOpt = 0.05; // Mock optimized value
    const modelSigmaVV = (A / Math.cos(theta)) * Math.pow((epsilonOpt - 1) / (epsilonOpt + 1), B) * Math.exp(-C * Math.cos(theta) * k * sOpt);
    const modelSigmaVH = E * Math.pow(modelSigmaVV ** 2, F);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <h2>Results</h2>
        <p><strong>Optimized Dielectric Constant (epsilon):</strong> ${epsilonOpt.toFixed(2)}</p>
        <p><strong>Optimized Surface Roughness (s):</strong> ${sOpt.toFixed(2)} meters</p>
        <p><strong>Modeled Sigma VV:</strong> ${modelSigmaVV.toExponential(2)}</p>
        <p><strong>Modeled Sigma VH:</strong> ${modelSigmaVH.toExponential(2)}</p>
    `;

    plotData([sigmaVV, sigmaVH], [modelSigmaVV, modelSigmaVH]);
}

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