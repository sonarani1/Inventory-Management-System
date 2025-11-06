from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register,
    login,
    ProductViewSet,
    OrderViewSet,
    InventoryLogViewSet,
    dashboard_stats,
    inventory_summary,
    stock_chart_data,
    CategoryViewSet,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'inventory', InventoryLogViewSet, basename='inventory')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    path('dashboard/inventory-summary/', inventory_summary, name='inventory_summary'),
    path('dashboard/stock-chart/', stock_chart_data, name='stock_chart_data'),
    path('', include(router.urls)),
]

