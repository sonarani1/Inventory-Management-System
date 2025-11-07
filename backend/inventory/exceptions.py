# Global Exception Handler for Backend
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # Customize the response
    if response is not None:
        custom_response_data = {
            'error': True,
            'status_code': response.status_code,
            'message': None,
            'detail': None,
            'errors': {}
        }

        # Extract error details
        if isinstance(response.data, dict):
            # Handle validation errors
            if 'detail' in response.data:
                custom_response_data['message'] = str(response.data['detail'])
            else:
                # Handle field errors
                custom_response_data['errors'] = response.data
                custom_response_data['message'] = 'Validation failed'
        elif isinstance(response.data, list):
            custom_response_data['message'] = ', '.join([str(item) for item in response.data])
        else:
            custom_response_data['message'] = str(response.data)

        response.data = custom_response_data

        # Log the error
        logger.error(f"API Error: {response.status_code} - {custom_response_data['message']}")

    else:
        # Handle unexpected errors
        logger.exception("Unhandled exception occurred")
        response = Response(
            {
                'error': True,
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An unexpected error occurred. Please try again later.',
                'detail': None,
                'errors': {}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response

