from django.db import models
from django.contrib.auth.models import User

#Category Model (Name, User)
class Category(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = [['name', 'user']]

    def __str__(self):
        return self.name

#Product Model(name, sku, quantity, price, description)
class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')

    class Meta:
        unique_together = [['sku', 'user']]

    def __str__(self):
        return self.name


# Order Model that has :- product,quantity,status.
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Shipped', 'Shipped'),
        ('Completed', 'Completed'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} - {self.product.name}"


# Inventory Model that has :- product,quantity

class InventoryLog(models.Model):
    CHANGE_TYPES = [
        ('Added', 'Added'),
        ('Removed', 'Removed'),
        ('Sold', 'Sold'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.change_type} {self.quantity} of {self.product.name}"