import pandas as pd
from sklearn.tree import DecisionTreeClassifier

class SymptomModel:

    def __init__(self):
        data = pd.read_csv("dataset.csv")

        self.X = data.drop("disease", axis=1)
        self.y = data["disease"]

        self.model = DecisionTreeClassifier()
        self.model.fit(self.X, self.y)

        self.symptom_list = list(self.X.columns)

    def predict(self, symptoms):
        input_data = [0] * len(self.symptom_list)

        for s in symptoms:
            if s in self.symptom_list:
                input_data[self.symptom_list.index(s)] = 1

        prediction = self.model.predict([input_data])[0]

        severity = "low"
        if prediction in ["Heart Disease"]:
            severity = "high"
        elif prediction in ["Flu", "Bronchitis"]:
            severity = "medium"

        return {
            "conditions": [prediction],
            "severity": severity,
            "advice": self.get_advice(prediction)
        }

    def get_advice(self, disease):
        advice_map = {
            "Flu": "Drink warm fluids and rest",
            "Common Cold": "Take steam inhalation",
            "Migraine": "Rest in dark room",
            "Heart Disease": "Seek immediate medical attention",
            "Food Poisoning": "Stay hydrated",
            "Bronchitis": "Avoid cold air",
            "Viral Fever": "Take paracetamol and rest"
        }
        return advice_map.get(disease, "Consult doctor if symptoms persist")

model = SymptomModel()