document.getElementById("calculate-btn").addEventListener("click", calculate);


// User inputs
// const sigmaVV_dB = parseFloat(document.getElementById("entry_vv").value);
// const sigmaVH_dB = parseFloat(document.getElementById("entry_vh").value);
// const thetaDeg = parseFloat(document.getElementById("entry_theta").value);
function  calculate(){

const sigmaVV_dB = parseFloat(document.getElementById("sigma_vv").value);
const sigmaVH_dB= parseFloat(document.getElementById("sigma_vh").value);
const thetaDeg = parseFloat(document.getElementById("theta").value);
// Convert inputs
const sigmaVV = Math.pow(10, sigmaVV_dB / 10);
const sigmaVH = Math.pow(10, sigmaVH_dB / 10);
const theta = (thetaDeg * Math.PI) / 180; // Convert to radians
const k = (2 * Math.PI) / 0.056; // Wave number for given wavelength

// Define constants (replace A, B, C, E, F with actual values)
const A = 1, B = 1, C = 1, E = 1, F = 1;

// Objective function
function objective(params) {
    const epsilon = params[0];
    const s = params[1];
    const modelSigmaVV = (A / cos(theta)) * pow((epsilon - 1) / (epsilon + 1), B) * exp(-C * cos(theta) * k * s);
    const modelSigmaVH = E * pow(modelSigmaVV ** 2, F);
    const errorVV = Math.pow(modelSigmaVV - sigmaVV, 2);
    const errorVH = Math.pow(modelSigmaVH - sigmaVH, 2);
    return errorVV + errorVH;
}

// Refined grid search for initial guess
const epsilonRange1 = Array.from({ length: 50 }, (_, i) => 1 + (79 / 49) * i);
const sRange = Array.from({ length: 50 }, (_, i) => 0.01 + (0.09 / 49) * i);

let bestParams = null;
let bestObjectiveValue = Infinity;

// First pass optimization within epsilon range 1 to 80
for (const epsilon of epsilonRange1) {
    for (const s of sRange) {
        const result = numeric.uncmin(objective, [epsilon, s], 1e-6, 50, 1e-6, [1, 80], [0.01, 0.1]);
        if (result.f < bestObjectiveValue) {
            bestObjectiveValue = result.f;
            bestParams = result.solution;
        }
    }
}

// If the best epsilon is at the boundary, expand the search range
if (bestParams[0] >= 80) {
    const epsilonRange2 = Array.from({ length: 50 }, (_, i) => 80 + (2920 / 49) * i);
    for (const epsilon of epsilonRange2) {
        for (const s of sRange) {
            const result = numeric.uncmin(objective, [epsilon, s], 1e-6, 50, 1e-6, [80, 3000], [0.01, 0.1]);
            if (result.f < bestObjectiveValue) {
                bestObjectiveValue = result.f;
                bestParams = result.solution;
            }
        }
    }
}

const [epsilonOpt, sOpt] = bestParams;

// Calculate model_sigma_vv and model_sigma_vh using the optimized values
const modelSigmaVV = (A / cos(theta)) * pow((epsilonOpt - 1) / (epsilonOpt + 1), B) * exp(-C * cos(theta) * k * sOpt);
const modelSigmaVH = E * pow(modelSigmaVV ** 2, F);

// Sample height measurements
const heights = [1.0, 1.2, 0.9, 1.1, 1.3, 1.0, 0.8, 1.0, 1.1, 1.2, 1.0];
const meanHeight = mean(heights);
const squaredDeviations = heights.map(height => Math.pow(height - meanHeight, 2));
const rmsHeight = sqrt(mean(squaredDeviations));

// Topp equation to convert ε to soil moisture
function toppEquation(epsilon) {
    return 4.3e-6 * pow(epsilon, 3) - 5.5e-4 * pow(epsilon, 2) + 2.92e-2 * epsilon - 5.3e-2;
}

const soilMoisture = toppEquation(epsilonOpt);

// Empirical soil roughness
const kEmpirical = 0.5;
const soilRoughness = kEmpirical * (sigmaVV / sigmaVH);

// Error metrics
const observedSigmaVV = [sigmaVV];
const observedSigmaVH = [sigmaVH];
const predictedSigmaVV = [modelSigmaVV];
const predictedSigmaVH = [modelSigmaVH];

function calculateMetrics(observed, predicted) {
    const mae = mean(observed.map((obs, i) => Math.abs(obs - predicted[i])));
    const mse = mean(observed.map((obs, i) => Math.pow(obs - predicted[i], 2)));
    const rmse = sqrt(mse);
    const r2 = observed.length > 1 ? 1 - mse / mean(observed.map(obs => Math.pow(obs - mean(observed), 2))) : 'N/A';
    return { mae, mse, rmse, r2 };
}

const metricsVV = calculateMetrics(observedSigmaVV, predictedSigmaVV);
const metricsVH = calculateMetrics(observedSigmaVH, predictedSigmaVH);

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ` 
           <p><strong>Optimized Dielectric Constant (epsilon):</strong> ${epsilonOpt}</p>
           <p>Estimated Soil Moisture: ${soilMoisture} or ${soilMoisture}% </p>
           <p>Estimated Soil Roughness: ${soilRoughness} meters </p>
           <p>Modeled sigma_vv: ${modelSigmaVV}</p>
           <p>Modeled sigma_vh: ${modelSigmaVH.toExponential(2)}</p>`;
// console.log({
//     epsilonOpt,
//     sOpt,
//     modelSigmaVV,
//     modelSigmaVH,
//     soilMoisture,
//     soilRoughness,
//     metricsVV,
//     metricsVH,
//     rmsHeight
    
// });
}
