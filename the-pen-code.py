import numpy as np
import pandas as pd
import glob
from scipy.signal import welch
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import m2cgen as m2c  # Install via: pip install m2cgen

# --- 1. FEATURE EXTRACTION FUNCTION ---
def extract_features(data_segment, fs=50.0):
    """
    Extracts time-domain and frequency-domain features from IMU data.
    - fs: Sampling frequency in Hz (typically ~50 Hz for IMU data).
    """
    features = []
    
    # Process magnitude of Acceleration and Gyroscope
    acc_mag = np.sqrt(data_segment['Cal1']**2 + data_segment['Cal2']**2 + data_segment['Cal3']**2)
    gyro_mag = np.sqrt(data_segment['Cal4']**2 + data_segment['Cal5']**2 + data_segment['Cal6']**2)
    
    for sig in [acc_mag, gyro_mag]:
        # Time-domain features
        mean_val = np.mean(sig)
        std_val = np.std(sig)
        max_val = np.max(sig)
        
        # Frequency-domain features (Power Spectral Density using Welch's method)
        freqs, psd = welch(sig - mean_val, fs=fs, nperseg=min(len(sig), 64))
        
        # Energy in tremor frequency band (4 - 7 Hz)
        tremor_band_idx = np.where((freqs >= 4.0) & (freqs <= 7.0))[0]
        tremor_power = np.sum(psd[tremor_band_idx]) if len(tremor_band_idx) > 0 else 0.0
        
        # Energy in intentional movement band (0.5 - 3.5 Hz)
        intent_band_idx = np.where((freqs >= 0.5) & (freqs <= 3.5))[0]
        intent_power = np.sum(psd[intent_band_idx]) if len(intent_band_idx) > 0 else 0.0
        
        # Ratio of Tremor Power to Total Power
        total_power = np.sum(psd) + 1e-6
        tremor_ratio = tremor_power / total_power
        
        features.extend([mean_val, std_val, max_val, tremor_power, intent_power, tremor_ratio])
        
    return features

# --- 2. DATA PROCESSING & DATASET PREPARATION ---
# Example CSV loading format based on participant trial data
file_list = glob.glob("user_*_activity_*_trial_*.csv")

X, y = [], []
WINDOW_SIZE = 128  # ~2.5 seconds window at 50Hz
STEP_SIZE = 64     # 50% overlap

for file in file_list:
    df = pd.read_csv(file)
    # Determine label from filename or subject metadata (1 = Parkinson's, 0 = Control)
    is_parkinsons = 1 if "user_01" in file or "parkinson" in file.lower() else 0
    
    for start in range(0, len(df) - WINDOW_SIZE, STEP_SIZE):
        window = df.iloc[start : start + WINDOW_SIZE]
        feats = extract_features(window, fs=50.0)
        X.append(feats)
        y.append(is_parkinsons)

X = np.array(X)
y = np.array(y)
    
# --- 3. TRAIN CLASSIFIER ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=15, max_depth=6, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(f"Model Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(classification_report(y_test, y_pred))

# --- 4. EXPORT TO C CODE FOR ARDUINO NANO 33 BLE ---
code_c = m2c.export_to_c(clf)
with open("model.h", "w") as f:
    f.write("#ifndef MODEL_H\n#define MODEL_H\n\n")
    f.write(code_c)
    f.write("\n\n#endif\n")

print("Generated 'model.h' successfully for C/C++ embedding!")