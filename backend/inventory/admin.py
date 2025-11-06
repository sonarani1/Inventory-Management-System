from django.contrib import admin
from .models import Product, Order, InventoryLog, Category
# Register your models here.

admin.site.register(Product)
admin.site.register(Order)
admin.site.register(InventoryLog)
admin.site.register(Category)