import joblib
import pandas as pd
import os

# Define paths
MODEL_PATH = r"c:\Users\Irfan IR\Documents\IR Projects\RouteSaathi 2.0\backend\models\backup_predictor_rf.joblib"
FEATURE_COLS_PATH = r"c:\Users\Irfan IR\Documents\IR Projects\RouteSaathi 2.0\backend\models\feature_columns.joblib"

try:
    # Load model and feature columns
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURE_COLS_PATH)

    print("Model loaded successfully.")
    print(f"Model type: {type(model)}")
    print(f"Feature columns ({len(feature_columns)}):")
    print(feature_columns)

    # Inspect model parameters if possible
    if hasattr(model, 'n_features_in_'):
        print(f"Number of features expected: {model.n_features_in_}")

except Exception as e:
    print(f"Error loading model: {e}")
