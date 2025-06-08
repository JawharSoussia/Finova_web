from flask import Flask, request, jsonify
from recommender import TransactionBasedRecommender

app = Flask(__name__)
recommender = TransactionBasedRecommender()

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get("userId")
    recommendations = recommender.get_recommendations(user_id)
    return jsonify(recommendations)

@app.route("/api/history-recommendations", methods=["GET"])
def get_history_recommendations():
    """
    API endpoint to get recommendations based on user's transaction history.
    """
    user_id = request.args.get("userId")
    k = int(request.args.get("k", 5))  # Optional parameter for the number of similar users to consider
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    
    recommendations = recommender.get_history_based_recommendations(user_id, k)
    return jsonify(recommendations)

@app.route("/api/goal-recommendations", methods=["POST"])
def get_goal_recommendations():
    """
    API endpoint to generate recommendations for a savings goal.
    """
    data = request.json
    goal_name = data.get("name")
    target_amount = data.get("targetAmount")
    months = data.get("months", 12)  # Default to 12 months if not provided

    if not goal_name or not target_amount:
        return jsonify({"error": "Goal name and target amount are required"}), 400

    # Dynamic recommendation logic
    recommendations = {
        "Emergency Fund": [
            {
                "title": "Emergency Fund Strategy",
                "description": "Aim to save 3-6 months of living expenses.",
                "suggestedMonthlyContribution": target_amount / 12,
                "tips": [
                    "Automate monthly transfers",
                    "Keep funds in high-yield savings account",
                    "Prioritize this goal before discretionary spending",
                ],
            },
        ],
        "Vacation": [
            {
                "title": "Vacation Savings Optimization",
                "description": "Break down your vacation savings into manageable monthly contributions.",
                "suggestedMonthlyContribution": target_amount / months,
                "tips": [
                    "Look for travel deals and discounts",
                    "Consider off-peak season travel",
                    "Use travel rewards credit cards",
                ],
            },
        ],
        "Home Down Payment": [
            {
                "title": "Home Savings Accelerator",
                "description": "Strategize your savings to reach your down payment goal faster.",
                "suggestedMonthlyContribution": target_amount / months,
                "tips": [
                    "Explore first-time homebuyer programs",
                    "Consider additional income streams",
                    "Reduce high-interest debt",
                ],
            },
        ],
        "Car Purchase": [
            {
                "title": "Vehicle Savings Plan",
                "description": "Build a targeted savings strategy for your dream car.",
                "suggestedMonthlyContribution": target_amount / months,
                "tips": [
                    "Compare financing options",
                    "Save for additional costs (insurance, maintenance)",
                    "Consider used vehicles to reduce total cost",
                ],
            },
        ],
        "Default": [
            {
                "title": "Generic Savings Recommendation",
                "description": "Smart approach to achieving your financial goal.",
                "suggestedMonthlyContribution": target_amount / months,
                "tips": [
                    "Break down your goal into monthly milestones",
                    "Track progress regularly",
                    "Adjust savings strategy as needed",
                ],
            },
        ],
    }

    category = recommendations.get(goal_name, recommendations["Default"])
    return jsonify(category)

if __name__ == "__main__":
    app.run(debug=True)
