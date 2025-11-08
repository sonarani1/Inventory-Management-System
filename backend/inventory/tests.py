from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Product, Order, InventoryLog


class UserRegistrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_register_user(self):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Test123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
    
    def test_register_duplicate_username(self):
        User.objects.create_user(username='testuser', password='Test123')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Test123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='Test123'
        )
    
    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'Test123'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'WrongPassword'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProductTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='Test123')
        self.client.force_authenticate(user=self.user)
    
    def test_list_products(self):
        Product.objects.create(
            name='Product 1',
            sku='SKU001',
            quantity=10,
            price=50.00,
            user=self.user  # add this if your Product model links to User
        )
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_product(self):
        data = {
            'name': 'Test Product',
            'sku': 'TEST001',
            'quantity': 10,
            'price': '99.99',
            'description': 'Test description'
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
    
    def test_update_product(self):
        product = Product.objects.create(
            name='Product 1',
            sku='SKU001',
            quantity=10,
            price=50.00,
            user=self.user  # add this field if it exists in your model!
        )
        data = {'name': 'Updated Product', 'sku': 'SKU001', 'quantity': 15, 'price': '60.00'}
        response = self.client.put(f'/api/products/{product.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.quantity, 15)



class OrderTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='Test123')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(
            name='Test Product',
            sku='SKU001',
            quantity=10,
            price=50.00,
            user=self.user     
        )
    def test_create_order(self):
        data = {
            'product': self.product.id,
            'quantity': 5,
            'status': 'Pending'
        }
        response = self.client.post('/api/orders/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 5)

    
    def test_create_order_insufficient_stock(self):
        data = {
            'product': self.product.id,
            'quantity': 15,
            'status': 'Pending'
        }
        response = self.client.post('/api/orders/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        
class DashboardEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='dashuser', password='Test123')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(name='P1', sku='S1', quantity=5, price=10.0, user=self.user)
        InventoryLog.objects.create(product=self.product, change_type='Added', quantity=5)

    def test_dashboard_stats(self):
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('total_stock', res.data)

    def test_inventory_summary(self):
        res = self.client.get('/api/dashboard/inventory-summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(res.data, list))

    def test_stock_chart(self):
        res = self.client.get('/api/dashboard/stock-chart/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('dates', res.data)
        self.assertIn('stock_levels', res.data)


class CategoryTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='catuser', password='Test123')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(name='P1', sku='S1', quantity=5, price=10.0, user=self.user)

    def test_create_list_category(self):
        res = self.client.post('/api/categories/', {'name': 'Electronics'})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        list_res = self.client.get('/api/categories/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

    
    def test_delete_pending_order(self):
        order = Order.objects.create(
            product=self.product,
            quantity=5,
            status='Pending',
            user=self.user
        )
        self.product.quantity = 5
        self.product.save()
        
        response = self.client.delete(f'/api/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)
    
    def test_delete_non_pending_order(self):
        order = Order.objects.create(
            product=self.product,
            quantity=5,
            status='Completed',
            user=self.user
        )
        
        response = self.client.delete(f'/api/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

