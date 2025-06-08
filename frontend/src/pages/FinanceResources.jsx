import { useState } from "react";
import { motion } from "framer-motion";

const financeResources = [
  { id: 1, title: "Savings and Investment Strategies", type: "Video", link: "https://youtu.be/blnbxbftme0?si=bFsGX-pvPMJ4kfbO", description: "Learn how to manage your budget effectively.", category: "Investing", icon: "📈" },
  { id: 2, title: "The Basics of Financial Management", type: "Article", link: "https://www.netsuite.com/portal/resource/articles/financial-management/financial-management.shtml", description: "Discover strategies to maximize your savings and achieve your financial goals faster.", category: "Personal Finance", icon: "💰" },
  { id: 3, title: "Secrets of saving money", type: "Podcast", link: "https://youtu.be/ms1nTeFO7ps?si=yEItHYFUf-BHFytY", description: "Listen to experts share their tips for successful real estate investing.", category: "Video", icon: "🏠" },
  { id: 4, title: "Budget Management: Essential Tools", type: "Guide", link: "https://youtube.com/shorts/52B-vCJxZ3A?si=FAAh7u3Lt94FESJ0", description: "Explore the best tools and apps to manage your daily budget.", category: "Article", icon: "📊" },
  { id: 5, title: "Managing Your Daily Budget", type: "Webinar", link: "https://youtu.be/2CtJBWNHpfE", description: "Optimize budgeting and spending with contract data insights.", category: "Webinar", icon: "🔗" },
  { id: 6, title: "Common Money Management Mistakes to Avoid", type: "Video", link: "https://youtu.be/Q0uXGQu55GM?si=nZXJqBnkFMuLcURx", description: "Break bad money habits and build wealth with smart financial strategies", category: "Video", icon: "🖼️" },
];

export default function FinanceResources() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Video", "Article", "Webinar", "Investing", "Personal Finance"];

  const filteredResources =
    selectedCategory === "All"
      ? financeResources
      : financeResources.filter((res) => res.category === selectedCategory);

  return (
    <div className="min-h-screen w-full bg-[url('/img/navy.jpg')] bg-cover bg-fixed">
      <div className="min-h-screen w-full bg-black/60">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-white"
      >
        <h1 className="text-4xl font-bold text-center mb-8"><br></br>Financial Educational Resources</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full transition-all text-md font-medium shadow-md 
                ${selectedCategory === category ? "bg-purple-800 text-white" : "bg-white/30 hover:bg-white/50"}`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Resources List */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 border rounded-lg shadow-lg bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{resource.icon}</span>
                <h2 className="text-xl font-semibold">{resource.title}</h2>
              </div>
              <p className="text-md mb-4">{resource.description}</p>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:underline font-medium text-lg"
              >
                {resource.type} → View
              </a>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
</div>
  );
}
