# import numpy as np
# from typing import List, Dict, Tuple
# from collections import defaultdict
# import json
# import os

# class TransactionBasedRecommender:
#     def __init__(self):
#         self.user_transactions = defaultdict(list)  # {user_id: [transaction_ids]}
#         self.transaction_items = defaultdict(list)  # {transaction_id: [item_ids]}
#         self.item_transactions = defaultdict(list)  # {item_id: [transaction_ids]}
#         self.user_similarity = {}  # Cache for user similarity scores
        
#     def add_transaction(self, user_id: str, transaction_id: str, items: List[str]):
#         """Add a new transaction to the system"""
#         self.user_transactions[user_id].append(transaction_id)
#         self.transaction_items[transaction_id] = items
#         for item in items:
#             self.item_transactions[item].append(transaction_id)
#         # Clear similarity cache when new data is added
#         self.user_similarity = {}
        
#     def get_user_similarity(self, user1: str, user2: str) -> float:
#         """Calculate similarity between two users based on their transactions"""
#         if (user1, user2) in self.user_similarity:
#             return self.user_similarity[(user1, user2)]
            
#         transactions1 = set(self.user_transactions[user1])
#         transactions2 = set(self.user_transactions[user2])
        
#         if not transactions1 or not transactions2:
#             return 0.0
            
#         # Calculate Jaccard similarity
#         intersection = len(transactions1.intersection(transactions2))
#         union = len(transactions1.union(transactions2))
#         similarity = intersection / union if union > 0 else 0.0
        
#         self.user_similarity[(user1, user2)] = similarity
#         self.user_similarity[(user2, user1)] = similarity
#         return similarity
        
#     def get_recommendations(self, user_id: str, k: int = 5) -> List[str]:
#         """Get recommendations for a user based on similar users' transactions"""
#         if user_id not in self.user_transactions:
#             return []
            
#         # Get similar users
#         similar_users = []
#         for other_user in self.user_transactions:
#             if other_user != user_id:
#                 similarity = self.get_user_similarity(user_id, other_user)
#                 if similarity > 0:
#                     similar_users.append((other_user, similarity))
                    
#         # Sort by similarity
#         similar_users.sort(key=lambda x: x[1], reverse=True)
        
#         # Get items from similar users' transactions
#         recommended_items = defaultdict(float)
#         user_items = set()
#         for transaction_id in self.user_transactions[user_id]:
#             user_items.update(self.transaction_items[transaction_id])
            
#         for other_user, similarity in similar_users[:k]:
#             for transaction_id in self.user_transactions[other_user]:
#                 for item in self.transaction_items[transaction_id]:
#                     if item not in user_items:
#                         recommended_items[item] += similarity
                        
#         # Sort items by recommendation score
#         sorted_items = sorted(recommended_items.items(), 
#                             key=lambda x: x[1], 
#                             reverse=True)
#         return [item for item, _ in sorted_items]
        
#     def get_budget_recommendations(self, user_id: str, budget: float, item_prices: Dict[str, float], k: int = 5) -> List[str]:
#         """
#         Get recommendations for a user based on similar users' transactions,
#         filtered by a specified budget.
        
#         Args:
#             user_id (str): The ID of the user to recommend items for.
#             budget (float): The maximum budget for recommended items.
#             item_prices (Dict[str, float]): A dictionary mapping item IDs to their prices.
#             k (int): The number of similar users to consider.
        
#         Returns:
#             List[str]: A list of recommended item IDs within the budget.
#         """
#         # Get general recommendations
#         recommendations = self.get_recommendations(user_id, k)
        
#         # Filter recommendations by budget
#         budget_recommendations = [
#             item for item in recommendations
#             if item in item_prices and item_prices[item] <= budget
#         ]
        
#         return budget_recommendations

#     def get_history_based_recommendations(self, user_id: str, k: int = 5) -> List[str]:
#         """
#         Get recommendations for a user based on their transaction history
#         and similar users' transactions.
        
#         Args:
#             user_id (str): The ID of the user to recommend items for.
#             k (int): The number of similar users to consider.
        
#         Returns:
#             List[str]: A list of recommended item IDs.
#         """
#         if user_id not in self.user_transactions:
#             return []
        
#         # Get general recommendations
#         recommendations = self.get_recommendations(user_id, k)
        
#         # Filter recommendations to prioritize items frequently purchased by similar users
#         item_frequency = defaultdict(int)
#         for other_user in self.user_transactions:
#             if other_user != user_id:
#                 for transaction_id in self.user_transactions[other_user]:
#                     for item in self.transaction_items[transaction_id]:
#                         if item not in self.transaction_items[user_id]:
#                             item_frequency[item] += 1
        
#         # Sort items by frequency of occurrence in similar users' transactions
#         sorted_items = sorted(item_frequency.items(), key=lambda x: x[1], reverse=True)
        
#         return [item for item, _ in sorted_items[:k]]
        
#     def save_model(self, filepath: str):
#         """Save the model state to a file"""
#         data = {
#             'user_transactions': dict(self.user_transactions),
#             'transaction_items': dict(self.transaction_items),
#             'item_transactions': dict(self.item_transactions)
#         }
#         with open(filepath, 'w') as f:
#             json.dump(data, f)
            
#     def load_model(self, filepath: str):
#         """Load the model state from a file"""
#         if os.path.exists(filepath):
#             with open(filepath, 'r') as f:
#                 data = json.load(f)
#                 self.user_transactions = defaultdict(list, data['user_transactions'])
#                 self.transaction_items = defaultdict(list, data['transaction_items'])
#                 self.item_transactions = defaultdict(list, data['item_transactions'])
#                 self.user_similarity = {}
