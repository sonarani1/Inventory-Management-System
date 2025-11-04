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
