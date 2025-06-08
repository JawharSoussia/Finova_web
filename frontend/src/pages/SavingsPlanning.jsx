import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PiggyBank, Target, TrendingUp, Brain, XCircle ,MessageCircle} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
const COLORS = {
  primary: "from-blue-500 to-blue-600",
  secondary: "from-indigo-500 to-indigo-600",
  accent: "from-amber-400 to-amber-500",
  background: "bg-gray-50",
  card: "bg-white",
  textPrimary: "text-gray-800",
  textSecondary: "text-gray-600",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-800",
  info: "bg-sky-100 text-sky-800"
};

const SavingsGoalForm = ({ onAddGoal, goals = [] }) => {
  const [goal, setGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    priority: goals.length + 1
  });
  const [customGoal, setCustomGoal] = useState("");
  const [isLoadingSavings, setIsLoadingSavings] = useState(true);

  useEffect(() => {
    const fetchCurrentSavings = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:5000/api/savings-goals/current-savings",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setGoal(prev => ({
          ...prev,
          currentAmount: response.data.currentSavings.toFixed(2)
        }));
      } catch (error) {
        toast.error("Failed to load current savings");
      } finally {
        setIsLoadingSavings(false);
      }
    };
    fetchCurrentSavings();
  }, []);

  const { remainingAmount, percentageAchieved, estimatedMonthlySavings } = useMemo(() => {
    const target = parseFloat(goal.targetAmount) || 0;
    const current = parseFloat(goal.currentAmount) || 0;
    const remaining = Math.max(target - current, 0);
    const percentage = target > 0 ? ((current / target) * 100).toFixed(2) : 0;

    let monthly = 0;
    if (goal.targetDate && remaining > 0) {
      const targetDate = new Date(goal.targetDate);
      const months = Math.max(
        (targetDate.getFullYear() - new Date().getFullYear()) * 12 +
        targetDate.getMonth() - new Date().getMonth(),
        1
      );
      monthly = (remaining / months).toFixed(2);
    }

    return { remainingAmount: remaining, percentageAchieved: percentage, estimatedMonthlySavings: monthly };
  }, [goal]);

  const handleSubmit = useCallback(async () => {
    if ((!goal.name && !customGoal.trim()) || !goal.targetAmount || !goal.targetDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5000/api/savings-goals",
        { ...goal, name: goal.name || customGoal.trim(), priority: goal.priority || (goals.length + 1) },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      onAddGoal(response.data);
      setGoal({ name: "", targetAmount: "", currentAmount: "", targetDate: "", priority: goals.length + 2 });
      setCustomGoal("");
      toast.success("Goal added to queue!");
    } catch (error) {
      toast.error("Failed to create goal");
    }
  }, [goal, customGoal, onAddGoal, goals.length]);

 return (
    <div className={`${COLORS.card} shadow-xl rounded-2xl p-6 mb-8 border border-gray-100`}>
      <header className="flex items-center mb-6">
        <Target className="text-blue-500 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Smart Savings Planner</h2>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Type</label>
            <select
              value={goal.name}
              onChange={(e) => setGoal(g => ({ ...g, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
            >
              <option value="">Select goal type</option>
              {["Emergency Fund", "Vacation", "Home", "Car", "Other"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Custom goal name"
              value={customGoal}
              onChange={(e) => {
                setCustomGoal(e.target.value);
                setGoal(g => ({ ...g, name: "" }));
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400 mt-2"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={goal.targetAmount}
                onChange={(e) => setGoal(g => ({ ...g, targetAmount: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
                placeholder="5000"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Savings {isLoadingSavings && "(Loading...)"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={goal.currentAmount}
                readOnly
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Date</label>
              <input
                type="date"
                value={goal.targetDate}
                onChange={(e) => setGoal(g => ({ ...g, targetDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <input
                type="number"
                min="1"
                max="10"
                value={goal.priority}
                onChange={e => setGoal(g => ({ ...g, priority: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
                placeholder="1 (highest)"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full py-3.5 bg-gradient-to-r ${COLORS.primary} text-white rounded-xl font-semibold hover:shadow-md transition-all mt-2`}
          >
            Add to Savings Queue
          </button>
        </div>

        <div className={`bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-2xl border border-teal-100`}>
          <div className="flex items-center mb-5">
            <Brain className="text-indigo-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Goal Analytics</h3>
          </div>

          <div className="space-y-5">
            <div className={`${COLORS.card} p-4 rounded-xl shadow-sm border border-gray-100`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-teal-500">💸</span>
                  <span className="text-sm font-medium text-gray-700">Remaining Amount</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">${remainingAmount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount needed to reach your target</p>
            </div>

            <div className={`${COLORS.card} p-4 rounded-xl shadow-sm border border-gray-100`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-indigo-500">📈</span>
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{percentageAchieved}%</span>
              </div>
              <div className="mt-3 h-2.5 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
                  style={{ width: `${percentageAchieved}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {parseFloat(goal.currentAmount || 0).toFixed(2)} of {parseFloat(goal.targetAmount || 0).toFixed(2)}
              </p>
            </div>

            <div className={`${COLORS.card} p-4 rounded-xl shadow-sm border border-gray-100`}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-amber-500">🗓️</span>
                  <span className="text-sm font-medium text-gray-700">Monthly Needed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">${estimatedMonthlySavings}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on target date: {goal.targetDate || "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalItem = ({ goal, onRemove }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");


  useEffect(() => {
    const updateProgress = () => {
      const newProgress = (goal.currentAmount / goal.targetAmount) * 100;
      setProgress(Math.min(newProgress, 100));
    };

    const updateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(goal.targetDate);
      const diff = targetDate - now;

      if (diff < 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h left`);
    };

    updateProgress();
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 3600000);
    return () => clearInterval(interval);
  }, [goal]);

  const handleDelete = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5000/api/savings-goals/${goal._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      onRemove(goal._id);
      toast.success("Goal removed!");
    } catch (error) {
      toast.error("Failed to remove goal");
    }
  };

  // Emoji/type mapping
  const typeEmoji = {
    'Home': '🏠',
    'Car': '🚗',
    'Vacation': '✈️',
    'Emergency Fund': '🚨',
    'Other': '⭐',
  };
  const emoji = typeEmoji[goal.name] || '💡';
  // Color by priority
  const priorityColors = [
    'from-blue-200 to-blue-100',
    'from-purple-200 to-purple-100',
    'from-pink-200 to-pink-100',
    'from-green-200 to-green-100',
    'from-yellow-200 to-yellow-100',
  ];
  const cardColor = priorityColors[(goal.priority - 1) % priorityColors.length];

 return (
    <div className={`bg-gradient-to-br ${cardColor} p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition relative`}>
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
      >
        <XCircle size={20} />
      </button>
      
      <div className="flex items-start mb-4">
        <span className="text-3xl mr-3">{emoji}</span>
        <div>
          <h3 className="font-bold text-gray-800">{goal.name}</h3>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(goal.targetDate).toLocaleDateString()} • {timeLeft}
          </div>
        </div>
      </div>
      
      {/* Progress section */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600">Progress</div>
          <div className="font-semibold text-gray-900">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Priority</div>
          <div className="font-semibold text-gray-900">
            {goal.priority}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2.5 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Amounts */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Saved: ${parseFloat(goal.currentAmount).toFixed(2)}</span>
        <span className="text-gray-900 font-medium">Target: ${parseFloat(goal.targetAmount).toFixed(2)}</span>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Show welcome message from Maria on first open
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: "Hi! I'm Maria, your AI assistant in Finova. I can now process PDF documents to give you better financial advice! You can upload documents like bank statements, investment reports, or financial guides. How can I assist you today? 😊"
        }
      ]);
    }
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsLoading(true);
      await axios.post(
        "http://localhost:5000/api/documents",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          }
        }
      );
      setSelectedFile(file.name);
      toast.success('Document uploaded successfully!');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: `I've processed "${file.name}". You can now ask me questions about its contents! 📄`
      }]);
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/chatbot",
        { 
          question: chatInput,
          context: selectedFile ? { documentName: selectedFile } : undefined
        },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("authToken")}` 
          } 
        }
      );
      
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'bot', text: data.response }
      ]);
    } catch (error) {
      toast.error("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, isLoading, selectedFile]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
      <div className="h-80 mb-4 overflow-y-auto space-y-4 pr-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' ? (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shadow border border-indigo-200">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="bg-indigo-50 text-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-2xl rounded-br-none shadow-sm">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-full px-4 py-2.5 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-gray-600">
              <span className="text-xl">📎</span>
              <span>
                {selectedFile ? `Uploaded: ${selectedFile}` : 'Upload PDF Document'}
              </span>
            </div>
          </label>
          {selectedFile && (
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-red-500 p-2"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about savings strategies or your documents..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`px-5 py-3 bg-gradient-to-r ${COLORS.primary} text-white rounded-xl font-medium hover:shadow disabled:opacity-50`}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};


const ChatbotFloating = () => {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);

  // Trap focus when open
  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.focus();
    }
  }, [open]);

  return (
        <>
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 shadow-lg flex items-center justify-center text-white text-3xl hover:scale-110 transition-all border-4 border-white"
        onClick={() => setOpen(true)}
        aria-label="Open Chatbot"
      >
        <MessageCircle className="fill-current" size={24} />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl shadow-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 animate-fade-in-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-teal-500 to-indigo-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <MessageCircle className="text-teal-500" size={20} />
                </div>
                <span className="text-lg font-bold text-white">Financial Assistant</span>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-400 text-white"
                onClick={() => setOpen(false)}
                aria-label="Close Chatbot"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function SavingsPlanning() {
  const [goals, setGoals] = useState([]);
  const [currentSavings, setCurrentSavings] = useState(0);

  // Budget Overview Calculations
  const totalGoals = goals.length;
  const totalTarget = goals.reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (parseFloat(g.currentAmount) || 0), 0);
  const percentAchieved = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  const checkOldestGoal = useCallback(async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:5000/api/savings-goals/check-oldest",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.processed) {
        setGoals(prev => prev.filter(g => g._id !== response.data.processedGoal._id));

        // Ajoutez ce bloc pour déclencher la notification
        toast[response.data.status === 'achieved' ? 'success' : 'error'](
          `Goal "${response.data.processedGoal.name}" ${response.data.status}!`,
          {
            onOpen: () => {
              // Envoyez la notification via l'API
              axios.post('/api/notifications', {
                type: response.data.status,
                message: `Goal ${response.data.processedGoal.name} ${response.data.status}`,
                goalId: response.data.processedGoal._id
              }, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
            }
          }
        );
      }
    } catch (error) {
      console.error("Error checking goals:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const [goalsRes, savingsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/savings-goals",
            { headers: { Authorization: `Bearer ${authToken}` } }),
          axios.get("http://localhost:5000/api/savings-goals/current-savings",
            { headers: { Authorization: `Bearer ${authToken}` } })
        ]);

        const currentSavings = Number(savingsRes.data.currentSavings) || 0;
        const goalsWithLiveData = goalsRes.data.map(goal => ({
          ...goal,
          currentAmount: currentSavings,
          priority: typeof goal.priority !== 'undefined' ? goal.priority : 1
        }));

        setGoals(goalsWithLiveData);
        setCurrentSavings(currentSavings);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
      checkOldestGoal();
    }, 300000);

    return () => clearInterval(interval);
  }, [checkOldestGoal]);

  const handleRemoveGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g._id !== goalId));
  };

  const fetchGoals = async () => {
    const authToken = localStorage.getItem("authToken");
    const response = await axios.get("http://localhost:5000/api/savings-goals", {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    setGoals(response.data);
  };

  return (
     <div className={`min-h-screen ${COLORS.background} p-4 sm:p-6`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Budget Overview Widget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${COLORS.card} p-5 rounded-2xl shadow border border-gray-200 flex flex-col items-center`}>
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
              <Target className="text-teal-500" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{totalGoals}</span>
            <span className="text-sm text-gray-600">Total Goals</span>
          </div>
          
          <div className={`${COLORS.card} p-5 rounded-2xl shadow border border-gray-200 flex flex-col items-center`}>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <PiggyBank className="text-indigo-500" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">${totalTarget.toLocaleString()}</span>
            <span className="text-sm text-gray-600">Total Target</span>
          </div>
          
          <div className={`${COLORS.card} p-5 rounded-2xl shadow border border-gray-200 flex flex-col items-center`}>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.3.06.6.263.833a1 1 0 01-.72 1.617 1 1 0 01-.573-.193l-3.71-2.79-2.98 2.98a1 1 0 01-1.414-1.415l2.98-2.98-3.71-2.79a1 1 0 01.573-1.733l6.856-.59L11.033 3.7A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">${totalSaved.toLocaleString()}</span>
            <span className="text-sm text-gray-600">Total Saved</span>
          </div>
          
          <div className={`${COLORS.card} p-5 rounded-2xl shadow border border-gray-200 flex flex-col items-center`}>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <TrendingUp className="text-amber-500" size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{percentAchieved}%</span>
            <span className="text-sm text-gray-600">% Achieved</span>
          </div>
        </div>

        <header className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <PiggyBank className="text-blue-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI-Powered Financial Planner</h1>
            <p className="text-gray-600 mt-1">
              Current Savings: <span className="font-semibold text-blue-600">${currentSavings.toFixed(2)}</span>
            </p>
          </div>
        </header>

        <SavingsGoalForm onAddGoal={fetchGoals} goals={goals} />

        {goals.length > 0 && (
          <div className={`${COLORS.card} rounded-2xl shadow p-6 border border-gray-200`}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-teal-500" size={24} />
              Active Goals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => (
                <GoalItem
                  key={goal._id}
                  goal={goal}
                  onRemove={handleRemoveGoal}
                />
              ))}
            </div>
          </div>
        )}

        <ChatbotFloating />
      </div>
    </div>
  );
}