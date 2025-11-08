// Global Error Handler for Frontend
class ErrorHandler {
  static handle(error, context = '') {
    const errorInfo = {
      message: '',
      type: 'unknown',
      code: null,
      context,
      timestamp: new Date().toISOString(),
    };

    // Handle Axios errors
    if (error.response) {
      errorInfo.type = 'api_error';
      errorInfo.code = error.response.status;
      errorInfo.message = error.response.data?.error || 
                          error.response.data?.message || 
                          error.response.data?.detail ||
                          `API Error: ${error.response.statusText}`;
      
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          errorInfo.message = 'Unauthorized. Please login again.';
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
          break;
        case 403:
          errorInfo.message = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorInfo.message = 'Resource not found.';
          break;
        case 500:
          errorInfo.message = 'Server error. Please try again later.';
          break;
        default:
          break;
      }
    } else if (error.request) {
      errorInfo.type = 'network_error';
      errorInfo.message = 'Network error. Please check your connection.';
    } else {
      errorInfo.type = 'client_error';
      errorInfo.message = error.message || 'An unexpected error occurred.';
    }

    // Log error
    console.error(`[ErrorHandler] ${context}:`, errorInfo);

    return errorInfo;
  }

  static async handleAsync(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      return this.handle(error, context);
    }
  }
}

export default ErrorHandler;

