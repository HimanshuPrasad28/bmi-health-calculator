from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    
    age = float(data.get('age', 0))
    gender = data.get('gender', 'male')
    height = float(data.get('height', 0)) # in cm
    weight = float(data.get('weight', 0)) # in kg
    activity = data.get('activityLevel', 'sedentary')
    
    # Calculate BMI
    height_m = height / 100.0
    bmi = 0
    if height_m > 0:
        bmi = weight / (height_m * height_m)
        
    # Determine BMI Category
    bmi_category = "Normal Weight"
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal Weight"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"
        
    # Calculate BMR
    bmr = 0
    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
        
    # Activity Multipliers
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725
    }
    
    multiplier = activity_multipliers.get(activity, 1.2)
    daily_calories = bmr * multiplier
    
    # Generate Insights
    insights = ""
    if bmi_category == "Underweight":
        insights = "Your BMI suggests you are underweight. Consider a nutrient-dense diet to reach a healthy weight safely."
    elif bmi_category == "Normal Weight":
        insights = "Your BMI progress is normal. Maintain a balanced diet and regular activity for optimal health."
    elif bmi_category == "Overweight":
        insights = "Your BMI suggests you are overweight. Consider incorporating more physical activity and a balanced diet."
    else:
        insights = "Your BMI suggests obesity. It is recommended to consult a healthcare provider for a localized health plan."

    return jsonify({
        'bmi': round(bmi, 2),
        'bmi_category': bmi_category,
        'bmr': round(bmr, 0),
        'daily_calories': round(daily_calories, 0),
        'insights': insights
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
