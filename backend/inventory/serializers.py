from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Product, Order, InventoryLog, Category


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('user',)

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('user',)
    
    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Price can't be negative")
        return value
    
    def validate_quantity(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Number can't be negative")
        return value
    
    def validate(self, attrs):
        # Get the current user from the context (set in the view)
        user = self.context['request'].user if 'request' in self.context else None
        sku = attrs.get('sku')
        
        if user and sku:
            # Check if this SKU already exists for this user
            # Exclude the current instance if we're updating
            existing = Product.objects.filter(user=user, sku=sku)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'sku': f'Product with SKU "{sku}" already exists for your account.'
                })
        
        return attrs
    

# Adding serializer on Order
class OrderSerializer(serializers.ModelSerializer):
    # It will display product's name
    product_name = serializers.CharField(source='product.name', read_only=True)
    # It will display category name of the product
    product_category_name = serializers.CharField(source='product.category.name', read_only=True)
    
    class Meta:
        model = Order
        # include all the fields from the order model
        fields = '__all__'


# Adding serializer Inventory
class InventoryLogSerializer(serializers.ModelSerializer):
    # display name of the related product
    product_name = serializers.CharField(source='product.name', read_only=True)
    # displau sku of the related product
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = InventoryLog
        fields = '__all__'

