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
    CategorySerializer,
    OrderSerializer,
    InventoryLogSerializer
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
        # Creating inventory log entry for the initial quantity
        try:
            InventoryLog.objects.create(
                product=product,
                change_type='Added',
                quantity=product.quantity if product.quantity > 0 else 0
            )
        except Exception:
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

# creating orderviewset
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return orders for the current user
        qs = Order.objects.filter(user=self.request.user).select_related('product', 'product__category')
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(product__category_id=category_id)
        return qs
    
    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        
        # make sure the product belongs to the current user
        if product.user != self.request.user:
            raise drf_serializers.ValidationError({'product': 'You can only create orders for your own products'})
        
        if product.quantity < quantity:
            raise drf_serializers.ValidationError({'quantity': 'Insufficient stock'})
        
        product.quantity -= quantity
        product.save()
        
        order = serializer.save(user=self.request.user)
        
        InventoryLog.objects.create(
            product=product,
            change_type='Sold',
            quantity=quantity
        )
    
    def perform_update(self, serializer):
        old_order = Order.objects.get(pk=self.get_object().pk)
        old_product = old_order.product
        old_quantity = old_order.quantity
        
        order = serializer.save()
        new_product = order.product
        new_quantity = order.quantity
        
        # make sure the new product belongs to the current user
        if new_product.user != self.request.user:
            raise drf_serializers.ValidationError({'product': 'You can only update orders with your own products'})
        
        if old_product != new_product or old_quantity != new_quantity:
            old_product.quantity += old_quantity
            old_product.save()
            
            if new_product.quantity < new_quantity:
                old_product.quantity -= old_quantity
                old_product.save()
                raise drf_serializers.ValidationError({'quantity': 'Insufficient stock'})
            
            new_product.quantity -= new_quantity
            new_product.save()
            
            InventoryLog.objects.create(
                product=new_product,
                change_type='Sold',
                quantity=new_quantity
            )
    
    def perform_destroy(self, instance):
        if instance.status != 'Pending':
            raise drf_serializers.ValidationError({'error': 'Can only delete pending orders'})
        
        product = instance.product
        product.quantity += instance.quantity
        product.save()
        
        InventoryLog.objects.create(
            product=product,
            change_type='Added',
            quantity=instance.quantity
        )
        
        instance.delete()


class InventoryLogViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return inventory logs for products belonging to the current user
        return InventoryLog.objects.filter(product__user=self.request.user).select_related('product')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        # Filter all queries by current user
        user_products = Product.objects.filter(user=request.user)
        user_orders = Order.objects.filter(user=request.user)
        
        total_stock = user_products.aggregate(total=Sum('quantity'))['total'] or 0
        total_products = user_products.count()
        
        low_stock_products = user_products.filter(quantity__lt=10)
        low_stock_data = [
            {'name': p.name, 'stock': p.quantity}
            for p in low_stock_products
        ]
        
        top_selling = user_orders.values('product__name').annotate(
            total_orders=Count('id')
        ).order_by('-total_orders')[:5]
        
        top_selling_data = [
            {'product': item['product__name'] if item['product__name'] else 'N/A'}
            for item in top_selling
        ]
        
        pending_orders_count = user_orders.filter(status='Pending').count()
        
        return Response({
            'total_stock': total_stock,
            'total_products': total_products,
            'low_stock_products': low_stock_data,
            'top_selling_products': top_selling_data,
            'pending_orders_count': pending_orders_count,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_summary(request):
    try:
        # Filter products by current user
        products = Product.objects.filter(user=request.user).order_by('name')
        summary = []
        
        for product in products:
            # stock shows current product quantity (from Product model, updated after orders)
            current_quantity = product.quantity
            
            # OutStock shows Out of Stock if quantity is 0, else blank
            out_stock = 'Out of Stock' if current_quantity == 0 else ''
            
            summary.append({
                'product_name': product.name,
                'sku': product.sku,
                'in_stock': current_quantity,  
                'out_stock': out_stock,  
            })
        
        return Response(summary)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_chart_data(request):
    try:
        # filter inventory logs by products belonging to the current user
        logs = InventoryLog.objects.filter(product__user=request.user).order_by('timestamp')
        
        dates = []
        stock_levels = []
        
        current_stock = 0
        for log in logs:
            dates.append(log.timestamp.strftime('%Y-%m-%d'))
            if log.change_type == 'Added':
                current_stock += log.quantity
            elif log.change_type in ['Sold', 'Removed']:
                current_stock -= log.quantity
            stock_levels.append(current_stock)
        
        return Response({
            'dates': dates,
            'stock_levels': stock_levels,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)