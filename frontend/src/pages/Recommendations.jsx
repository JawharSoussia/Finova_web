import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Recommendations() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get('http://localhost:5000/api/recommendations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Immediately process and set card data
            let recommendationsData = [];
            
            if (Array.isArray(res.data)) {
                recommendationsData = res.data;
            } else if (Array.isArray(res.data?.cards)) {
                recommendationsData = res.data.cards;
            } else if (res.data?.recommendations) {
                recommendationsData = Array.isArray(res.data.recommendations) 
                    ? res.data.recommendations 
                    : [res.data.recommendations];
            } else if (res.data?.title) {
                recommendationsData = [res.data];
            }
            
            // Set cards directly without additional processing
            setCards(recommendationsData);
        } catch (err) {
            console.error('Recommendations fetch error:', err);
            setError('Failed to load recommendations. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Card rendering function optimized for performance
    const renderCard = (rec, idx) => {
        const cardColors = [
            { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
            { bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20' },
            { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
        ];
        
        const icons = [
            <svg key="1" className="text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
            <svg key="2" className="text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            <svg key="3" className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        ];
        
        const color = cardColors[idx % cardColors.length];
        const icon = icons[idx % icons.length];
        
        return (
            <div
                key={`card-${idx}`}
                className={`rounded-xl shadow-sm border ${color.border} ${color.bg} p-5 transition-all hover:shadow-md h-full`}
            >
                <div className="flex items-start h-full">
                    <div className="flex-shrink-0 mt-1">
                        {icon}
                    </div>
                    <div className="ml-4 flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            {rec.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {rec.detail}
                        </p>
                        
                        {rec.actionItems && rec.actionItems.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Action Items
                                </h3>
                                <ul className="space-y-2">
                                    {rec.actionItems.map((action, actionIdx) => (
                                        <li key={`action-${actionIdx}`} className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-slate-700 dark:text-slate-300">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-darkmode-700 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                        Personalized Financial Recommendations
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Actionable insights tailored to your financial situation
                    </p>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-center mb-10">
                    <button
                        onClick={fetchRecommendations}
                        className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Recommendations
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg text-slate-700 dark:text-slate-300">
                            Analyzing your financial patterns...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-5 mb-8 text-center">
                        <div className="flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                        <button
                            onClick={fetchRecommendations}
                            className="text-sm text-red-700 dark:text-red-300 font-medium hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Recommendations Grid - Render immediately */}
                {!loading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {cards.length > 0 ? (
                            cards.map(renderCard)
                        ) : (
                            <div className="col-span-full bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 mb-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                    No recommendations found
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
                                    We couldn't find personalized recommendations for your financial profile.
                                </p>
                                <button
                                    onClick={fetchRecommendations}
                                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center justify-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh recommendations
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}