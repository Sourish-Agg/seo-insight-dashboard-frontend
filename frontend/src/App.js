import React, { useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BusinessProvider, useBusinessContext } from "./context/BusinessContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Dashboard Component (using Context)
const Dashboard = () => {
  const {
    // State
    formData,
    businessData,
    loading,
    regeneratingHeadline,
    error,
    validationErrors,
    
    // Actions
    updateFormData,
    setLoading,
    setRegeneratingHeadline,
    setBusinessData,
    updateHeadline,
    setError,
    clearError,
    setValidationErrors,
    clearValidationErrors
  } = useBusinessContext();

  // Real-time validation
  useEffect(() => {
    const validateForm = () => {
      const errors = {};
      
      if (formData.name.length > 0 && formData.name.length < 2) {
        errors.name = 'Business name must be at least 2 characters';
      }
      if (formData.name.length > 100) {
        errors.name = 'Business name must be less than 100 characters';
      }
      
      if (formData.location.length > 0 && formData.location.length < 2) {
        errors.location = 'Location must be at least 2 characters';
      }
      if (formData.location.length > 100) {
        errors.location = 'Location must be less than 100 characters';
      }
      
      setValidationErrors(errors);
    };

    if (formData.name || formData.location) {
      const timer = setTimeout(validateForm, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, setValidationErrors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Basic input sanitization
    const sanitizedValue = value.replace(/[<>]/g, '');
    
    updateFormData(name, sanitizedValue);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.name.trim() || !formData.location.trim()) {
      setError('Please fill in both business name and location');
      return;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    clearError();
    await new Promise(res => setTimeout(res, 2000)); // Add this line

    try {
      const response = await axios.post(`${API}/business-data`, {
        name: formData.name.trim(),
        location: formData.location.trim()
      });
      setBusinessData(response.data);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid input provided');
      } else {
        setError('Failed to get business data. Please try again.');
      }
      console.error('Error:', err);
    }
  };

  const handleRegenerateHeadline = async () => {
    if (!businessData) return;

    setRegeneratingHeadline(true);
    await new Promise(res => setTimeout(res, 2000)); // Add this line for loader visibility
    try {
      const response = await axios.get(`${API}/regenerate-headline`, {
        params: {
          name: formData.name,
          location: formData.location
        }
      });
      updateHeadline(response.data.headline);
    } catch (err) {
      setError('Failed to regenerate headline. Please try again.');
      console.error('Error:', err);
    } finally {
      setRegeneratingHeadline(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center justify-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-6 h-6 text-yellow-400 fill-current animate-star-glow" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-6 h-6 text-yellow-400 animate-star-glow" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor"/>
                <stop offset="50%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            <path stroke="currentColor" strokeWidth="1" fill="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        <span className="ml-3 text-2xl font-bold text-gray-700">{rating}</span>
      </div>
    );
  };

  const getSentimentColor = (score) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-green-500';
    if (score >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentEmoji = (score) => {
    if (score >= 9) return '😍';
    if (score >= 8) return '😊';
    if (score >= 7) return '😐';
    return '😞';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20"></div>
        <div className="floating-shape-delayed absolute top-40 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
        <div className="floating-shape absolute bottom-32 left-1/4 w-40 h-40 bg-pink-200 rounded-full opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block mb-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-gradient">
              Business SEO Dashboard
            </h1>
            <div className="h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get comprehensive insights about your business's online presence with AI-powered analytics, 
            competitor analysis, and industry-specific recommendations.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Enhanced Input Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 animate-slide-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3">
                    Business Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Cake & Co, Tech Solutions Inc."
                      maxLength="100"
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 ${
                        validationErrors.name 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                      }`}
                    />
                    <div className="absolute right-3 top-4 text-sm text-gray-400">
                      {formData.name.length}/100
                    </div>
                  </div>
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1 animate-shake">{validationErrors.name}</p>
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-3">
                    Location
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Mumbai, New York, London"
                      maxLength="100"
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 ${
                        validationErrors.location 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                      }`}
                    />
                    <div className="absolute right-3 top-4 text-sm text-gray-400">
                      {formData.location.length}/100
                    </div>
                  </div>
                  {validationErrors.location && (
                    <p className="text-red-500 text-sm mt-1 animate-shake">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl animate-slide-in-down">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Object.keys(validationErrors).length > 0}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span className="animate-pulse">Analyzing Business...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Get Comprehensive Business Insights
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results will be displayed here when businessData exists */}
          {businessData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 animate-fade-in-up">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  📊 Business Insights for {formData.name}
                </h2>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🏢 {businessData.industry}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    📍 {formData.location}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    💰 {businessData.price_range}
                  </span>
                </div>
              </div>

              {/* Core metrics grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Google Rating */}
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200/50 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Google Rating</h3>
                  <div className="mb-3">
                    {renderStars(businessData.rating)}
                  </div>
                </div>

                {/* Reviews Count */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200/50 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Total Reviews</h3>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {businessData.reviews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Customer reviews</p>
                </div>

                {/* Sentiment Score */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200/50 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Customer Sentiment</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className={`text-4xl font-bold ${getSentimentColor(businessData.sentiment_score)}`}>
                      {businessData.sentiment_score}
                    </span>
                    <span className="text-3xl ml-2">{getSentimentEmoji(businessData.sentiment_score)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Out of 10</p>
                </div>
              </div>

              {/* SEO Headline Section */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-200/50 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 md:mb-0">AI-Generated SEO Headline</h3>
                  <button
                    onClick={handleRegenerateHeadline}
                    disabled={regeneratingHeadline}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
                  >
                    {regeneratingHeadline ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate ✨
                      </>
                    )}
                  </button>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed font-medium italic">
                  "{businessData.headline}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// App component with Context Provider
function App() {
  return (
    <BusinessProvider>
      <Dashboard />
    </BusinessProvider>
  );
}

export default App;