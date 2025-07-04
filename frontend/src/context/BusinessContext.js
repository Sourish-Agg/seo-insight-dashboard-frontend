import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Form data
  formData: {
    name: '',
    location: ''
  },
  
  // Business data from API
  businessData: null,
  
  // Loading states
  loading: false,
  regeneratingHeadline: false,
  
  // Error handling
  error: '',
  
  // Validation
  validationErrors: {}
};

// Action types
export const ACTION_TYPES = {
  // Form actions
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  RESET_FORM: 'RESET_FORM',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_REGENERATING_HEADLINE: 'SET_REGENERATING_HEADLINE',
  
  // Business data actions
  SET_BUSINESS_DATA: 'SET_BUSINESS_DATA',
  UPDATE_HEADLINE: 'UPDATE_HEADLINE',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Validation
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS'
};

// Reducer function
const businessReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value
        }
      };

    case ACTION_TYPES.RESET_FORM:
      return {
        ...state,
        formData: initialState.formData,
        businessData: null,
        error: '',
        validationErrors: {}
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTION_TYPES.SET_REGENERATING_HEADLINE:
      return {
        ...state,
        regeneratingHeadline: action.payload
      };

    case ACTION_TYPES.SET_BUSINESS_DATA:
      return {
        ...state,
        businessData: action.payload,
        loading: false,
        error: ''
      };

    case ACTION_TYPES.UPDATE_HEADLINE:
      return {
        ...state,
        businessData: {
          ...state.businessData,
          headline: action.payload
        },
        regeneratingHeadline: false
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        regeneratingHeadline: false
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: ''
      };

    case ACTION_TYPES.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload
      };

    case ACTION_TYPES.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {}
      };

    default:
      return state;
  }
};

// Create Context
const BusinessContext = createContext();

// Custom hook to use the context
export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

// Provider component
export const BusinessProvider = ({ children }) => {
  const [state, dispatch] = useReducer(businessReducer, initialState);

  // Action creators
  const actions = {
    // Form actions
    updateFormData: (field, value) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_FORM_DATA,
        payload: { field, value }
      });
    },

    resetForm: () => {
      dispatch({ type: ACTION_TYPES.RESET_FORM });
    },

    // Loading actions
    setLoading: (loading) => {
      dispatch({
        type: ACTION_TYPES.SET_LOADING,
        payload: loading
      });
    },

    setRegeneratingHeadline: (regenerating) => {
      dispatch({
        type: ACTION_TYPES.SET_REGENERATING_HEADLINE,
        payload: regenerating
      });
    },

    // Business data actions
    setBusinessData: (data) => {
      dispatch({
        type: ACTION_TYPES.SET_BUSINESS_DATA,
        payload: data
      });
    },

    updateHeadline: (headline) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_HEADLINE,
        payload: headline
      });
    },

    // Error handling
    setError: (error) => {
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: error
      });
    },

    clearError: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    },

    // Validation
    setValidationErrors: (errors) => {
      dispatch({
        type: ACTION_TYPES.SET_VALIDATION_ERRORS,
        payload: errors
      });
    },

    clearValidationErrors: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_VALIDATION_ERRORS });
    }
  };

  const contextValue = {
    ...state,
    ...actions
  };

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext;