import numpy as np
import arrr
# import matplotlib.pyplot as plt
from scipy.optimize import minimize
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from pyscript import document


# Model parameters (example values from literature)
A, B, C, E, F = 0.1, 1.0, 2.0, 0.05, 0.7

# Define the calculation function
def calculate(event):
    try:
        # Get user inputs
        sigma_vv_db = float(document.querySelector("#sigma_vv").value)
        sigma_vh_db =float(document.querySelector("#sigma_vh").value)
        theta_deg = float(document.querySelector("#theta").value)

        # Convert inputs
        sigma_vv = 10 ** (sigma_vv_db / 10)
        sigma_vh = 10 ** (sigma_vh_db / 10)
        theta = np.deg2rad(theta_deg)
        k = 2 * np.pi / 0.056

        # Define the objective function
        print('error free 1')   
        def objective(params):
            
            epsilon, s = params
            model_sigma_vv = (A / np.cos(theta)) * ((epsilon - 1) / (epsilon + 1)) ** B * np.exp(-C * np.cos(theta) * k * s)
            model_sigma_vh = E * (model_sigma_vv ** 2) ** F
            error_vv = (model_sigma_vv - sigma_vv) ** 2
            error_vh = (model_sigma_vh - sigma_vh) ** 2
            return error_vv + error_vh

        # Refined grid search for initial guess
        
        print('error free 2')
        epsilon_range_1 = np.linspace(1, 80, 50)
        s_range = np.linspace(0.01, 0.1, 50)

        best_params = None
        best_objective_value = float('inf')

        # First pass optimization within epsilon range 1 to 
        
        print('error free 3')
        for epsilon in epsilon_range_1:
            for s in s_range:
                result = minimize(objective, [epsilon, s], bounds=[(1, 80), (0.01, 0.1)], method='L-BFGS-B')
                if result.fun < best_objective_value:
                    best_objective_value = result.fun
                    best_params = result.x

        # If the best epsilon from the first pass is at the boundary, expand the search range
        
        print('error free 4')
        if best_params[0] >= 80:
            epsilon_range_2 = np.linspace(80, 3000, 50)
            for epsilon in epsilon_range_2:
                for s in s_range:
                    result = minimize(objective, [epsilon, s], bounds=[(80, 3000), (0.01, 0.1)], method='L-BFGS-B')
                    if result.fun < best_objective_value:
                        best_objective_value = result.fun
                        best_params = result.x

        epsilon_opt, s_opt = best_params
        
        print('error free 5')

        # Calculate model_sigma_vv and model_sigma_vh using the optimized values
        model_sigma_vv = (A / np.cos(theta)) * ((epsilon_opt - 1) / (epsilon_opt + 1)) ** B * np.exp(-C * np.cos(theta) * k * s_opt)
        model_sigma_vh = E * (model_sigma_vv ** 2) ** F

        # Sample height measurements (manual method)
        heights = np.array([1.0, 1.2, 0.9, 1.1, 1.3, 1.0, 0.8, 1.0, 1.1, 1.2, 1.0])
        mean_height = np.mean(heights)
        squared_deviations = (heights - mean_height) ** 2
        mean_squared_deviation = np.mean(squared_deviations)
        rms_height = np.sqrt(mean_squared_deviation)

        print('error free 6')
        # Topp equation to convert ε to soil moisture
        def topp_equation(epsilon):
            return 4.3e-6 * epsilon ** 3 - 5.5e-4 * epsilon ** 2 + 2.92e-2 * epsilon - 5.3e-2

        soil_moisture = topp_equation(epsilon_opt)
        k_empirical = 0.5
        soil_roughness = k_empirical * (sigma_vv / sigma_vh)

        # Error metrics
        # observed_sigma_vv = np.array([sigma_vv])
        # observed_sigma_vh = np.array([sigma_vh])
        # predicted_sigma_vv = np.array([model_sigma_vv])
        # predicted_sigma_vh = np.array([model_sigma_vh])

        # mae_vv = mean_absolute_error(observed_sigma_vv, predicted_sigma_vv)
        # mse_vv = mean_squared_error(observed_sigma_vv, predicted_sigma_vv)
        # rmse_vv = np.sqrt(mse_vv)
        # r2_vv = r2_score(observed_sigma_vv, predicted_sigma_vv) if len(observed_sigma_vv) > 1 else 'N/A'

        # mae_vh = mean_absolute_error(observed_sigma_vh, predicted_sigma_vh)
        # mse_vh = mean_squared_error(observed_sigma_vh, predicted_sigma_vh)
        # rmse_vh = np.sqrt(mse_vh)
        # r2_vh = r2_score(observed_sigma_vh, predicted_sigma_vh) if len(observed_sigma_vh) > 1 else 'N/A'

        # Show results in a messagebox
        results = f"""
      <p>  sigma_vv (linear scale): <b>{sigma_vv:.2e}                                                          </b></p>
       <p> sigma_vh (linear scale):<b> {sigma_vh:.2e}</b></p>
       <p> Incidence angle (theta) in radians:<b> {theta:.2f}</b></p>
       <p> Wave number (k): <b>{k:.2f}</b></p>
       <p> Optimized dielectric constant (epsilon): <b>{epsilon_opt:.2f}</b></p>
       <p> Optimized surface roughness (s): <b>{s_opt:.2f} meters</b></p>
       <p> Modeled sigma_vv: <b>{model_sigma_vv:.2e}</b></p>
       <p> Modeled sigma_vh: <b>{model_sigma_vh:.2e}</b></p>
       <p> Mean height: <b>{mean_height:.2f} cm</b></p>
       <p> RMS height (surface roughness):<b> {rms_height:.2f} cm</b></p>
       <p> Estimated Soil Moisture:<b> {soil_moisture:.3f} or {soil_moisture * 100:.1f}%</b></p>
       <p> Estimated Soil Roughness:<b> {soil_roughness:.2f} meters</b></p>

        """
        # Error Metrics for σ^0_VV:
        # Mean Absolute Error (MAE): {mae_vv:.2e}
        # Mean Squared Error (MSE): {mse_vv:.2e}
        # Root Mean Squared Error (RMSE): {rmse_vv:.2e}
        # R-squared (R²): {r2_vv}

        # Error Metrics for σ^0_VH:
        # Mean Absolute Error (MAE): {mae_vh:.2e}
        # Mean Squared Error (MSE): {mse_vh:.2e}
        # Root Mean Squared Error (RMSE): {rmse_vh:.2e}
        # R-squared (R²): {r2_vh}

        # messagebox.showinfo("Results", results)
        document.querySelector("#result_box").innerHTML=results

        # Plot results
        # fig, axs = plt.subplots(2, 2, figsize=(14, 10))

        # axs[0, 0].bar(['sigma_vv', 'sigma_vh'], [sigma_vv, sigma_vh], color=['blue', 'orange'])
        # axs[0, 0].set_title('Backscatter Coefficients')
        # axs[0, 0].set_ylabel('Value')
        # axs[0, 0].set_yscale('log')
        # for i, value in enumerate([sigma_vv, sigma_vh]):
        #     axs[0, 0].text(i, value, f'{value:.2e}', ha='center', va='bottom')

        # axs[0, 1].bar(['Modeled sigma_vv', 'Modeled sigma_vh'], [model_sigma_vv, model_sigma_vh], color=['blue', 'orange'])
        # axs[0, 1].set_title('Modeled Backscatter Coefficients')
        # axs[0, 1].set_ylabel('Value')
        # axs[0, 1].set_yscale('log')
        # for i, value in enumerate([model_sigma_vv, model_sigma_vh]):
        #     axs[0, 1].text(i, value, f'{value:.2e}', ha='center', va='bottom')

        # axs[1, 0].bar(['Dielectric Constant (ε)', 'Surface Roughness (s)'], [epsilon_opt, s_opt], color=['green', 'red'])
        # axs[1, 0].set_title('Estimated Parameters')
        # axs[1, 0].set_ylabel('Value')
        # for i, value in enumerate([epsilon_opt, s_opt]):
        #     axs[1, 0].text(i, value, f'{value:.2f}', ha='center', va='bottom')

        # axs[1, 1].bar(['Soil Moisture (%)', 'Soil Roughness (m)'], [soil_moisture * 100, soil_roughness], color=['purple', 'cyan'])
        # axs[1, 1].set_title('Soil Properties')
        # axs[1, 1].set_ylabel('Value')
        # for i, value in enumerate([soil_moisture * 100, soil_roughness]):
        #     axs[1, 1].text(i, value, f'{value:.2f}', ha='center', va='bottom')

        # plt.tight_layout()
        # plt.show()

        # fig, ax = plt.subplots(figsize=(8, 6))
        # ax.plot(heights, 'o-', label='Height Measurements')
        # ax.axhline(mean_height, color='r', linestyle='--', label=f'Mean Height: {mean_height:.2f} cm')
        # ax.set_title('Height Measurements and Mean Height')
        # ax.set_xlabel('Sample Index')
        # ax.set_ylabel('Height (cm)')
        # ax.legend()
        # plt.show()

    except Exception as e:
                # document.querySelector("#result_box").innerHTML="An error occurred"+{e}
                print('eerror',e)

