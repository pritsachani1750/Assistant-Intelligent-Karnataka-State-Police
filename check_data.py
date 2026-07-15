import pandas as pd
import os

folder = "dataset"

for file in os.listdir(folder):
    if file.endswith(".csv"):
        path = os.path.join(folder, file)
        df = pd.read_csv(path)
        print(file, "=", len(df))