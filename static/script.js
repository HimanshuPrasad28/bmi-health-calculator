document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('healthForm');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlClass = document.documentElement.classList;

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        if (htmlClass.contains('dark')) {
            htmlClass.remove('dark');
            htmlClass.add('light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            htmlClass.remove('light');
            htmlClass.add('dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    });

    // Form Submit handling
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const calculateBtn = form.querySelector('button[type="submit"]');
        const originalBtnContent = calculateBtn.innerHTML;
        calculateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span> Calculating...</span>';
        calculateBtn.disabled = true;

        const age = document.getElementById('age').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const activityLevel = document.getElementById('activity').value;

        try {
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ age, gender, height, weight, activityLevel })
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();
            
            // Populate Results
            document.getElementById('bmiValue').textContent = data.bmi;
            document.getElementById('bmiCategory').textContent = data.bmi_category;
            
            // Set styles for categories
            const categoryBadge = document.getElementById('bmiCategory');
            categoryBadge.className = "text-lg font-medium px-4 py-1.5 rounded-full text-sm shadow-sm transition-colors duration-500 ";
            
            if (data.bmi_category === 'Underweight') {
                categoryBadge.classList.add('bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/60', 'dark:text-blue-200');
            } else if (data.bmi_category === 'Normal Weight') {
                categoryBadge.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900/60', 'dark:text-green-200');
            } else if (data.bmi_category === 'Overweight') {
                categoryBadge.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900/60', 'dark:text-yellow-200');
            } else {
                categoryBadge.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900/60', 'dark:text-red-200');
            }

            // Animate counting numbers (Optional Enhancement)
            document.getElementById('dailyCalories').textContent = data.daily_calories;
            document.getElementById('bmrValue').textContent = data.bmr;
            document.getElementById('insightsText').textContent = data.insights;

            // Map BMI to percentage 0-100
            // 0-25% = Underweight (<18.5)
            // 25-50% = Normal Weight (18.5 - 24.9)
            // 50-75% = Overweight (25 - 29.9)
            // 75-100% = Obese (>=30)
            
            let percentage = 0;
            const bmi = parseFloat(data.bmi);
            if (bmi < 18.5) {
                // Map ~10-18.5 to 0-25%
                const cappedBmi = Math.max(10, bmi);
                percentage = ((cappedBmi - 10) / 8.5) * 25;
            } else if (bmi < 25) {
                // Map 18.5-25 to 25-50%
                percentage = 25 + ((bmi - 18.5) / 6.5) * 25;
            } else if (bmi < 30) {
                // Map 25-30 to 50-75%
                percentage = 50 + ((bmi - 25) / 5) * 25;
            } else {
                // Map 30-40 to 75-100%
                const cappedBmi = Math.min(40, bmi);
                percentage = 75 + ((cappedBmi - 30) / 10) * 25;
            }
            
            percentage = Math.max(2, Math.min(98, percentage)); // padding
            
            // Animate indicator after a tiny delay
            setTimeout(() => {
                document.getElementById('bmiIndicator').style.left = `${percentage}%`;
            }, 100);

            // Show results section
            const resultsDivider = document.getElementById('resultsDivider');
            const resultsSection = document.getElementById('resultsSection');
            
            if (resultsDivider.classList.contains('hidden')) {
                resultsDivider.classList.remove('hidden');
                resultsSection.classList.remove('hidden');
                
                // Allow CSS transition to prepare
                requestAnimationFrame(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            } else {
                // Re-trigger animation if already visible
                resultsSection.classList.remove('animate-fade-in-up');
                void resultsSection.offsetWidth; // trigger reflow
                resultsSection.classList.add('animate-fade-in-up');
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred during calculation. Please check if the server is running.");
        } finally {
            calculateBtn.innerHTML = originalBtnContent;
            calculateBtn.disabled = false;
        }
    });
});
