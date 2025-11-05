from rest_framework import viewsets, status, serializers as drf_serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
from .models import Product, Order, InventoryLog, Category
from .serializers import (
    UserRegistrationSerializer,
    ProductSerializer,
    CategorySerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_200_OK)
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return products for the current user
        qs = Product.objects.filter(user=self.request.user).select_related('category')
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs
    
    def get_serializer_context(self):
        # Pass request to serializer for validation
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        product = serializer.save(user=self.request.user)
        # Create inventory log entry for the initial quantity
        try:
            InventoryLog.objects.create(
                product=product,
                change_type='Added',
                quantity=product.quantity if product.quantity > 0 else 0
            )
        except Exception:
            # If log creation fails, it's not critical - product is still created
            pass
    
    def perform_update(self, serializer):
        old_product = self.get_object()
        old_quantity = old_product.quantity
        product = serializer.save()
        new_quantity = product.quantity
        
        if new_quantity != old_quantity:
            change = new_quantity - old_quantity
            change_type = 'Added' if change > 0 else 'Removed'
            InventoryLog.objects.create(
                product=product,
                change_type=change_type,
                quantity=abs(change)
            )