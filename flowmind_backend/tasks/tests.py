from datetime import datetime, timezone, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Goal, Task
from .scoring import compute_focus_score


def make_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


class ScoringTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='scorer', password='pass1234')
        self.goal = Goal.objects.create(user=self.user, title='Test Goal')

    def test_higher_priority_scores_higher(self):
        low = Task.objects.create(goal=self.goal, title='Low', priority=1, status='pending')
        high = Task.objects.create(goal=self.goal, title='High', priority=5, status='pending')
        self.assertGreater(compute_focus_score(high), compute_focus_score(low))

    def test_overdue_deadline_boosts_score(self):
        normal = Task.objects.create(goal=self.goal, title='Normal', priority=3, status='pending')
        overdue = Task.objects.create(
            goal=self.goal, title='Overdue', priority=3, status='pending',
            deadline=datetime.now(timezone.utc) - timedelta(days=1)
        )
        self.assertGreater(compute_focus_score(overdue), compute_focus_score(normal))

    def test_imminent_deadline_higher_than_far_deadline(self):
        soon = Task.objects.create(
            goal=self.goal, title='Soon', priority=3, status='pending',
            deadline=datetime.now(timezone.utc) + timedelta(hours=12)
        )
        later = Task.objects.create(
            goal=self.goal, title='Later', priority=3, status='pending',
            deadline=datetime.now(timezone.utc) + timedelta(days=30)
        )
        self.assertGreater(compute_focus_score(soon), compute_focus_score(later))


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_new_user(self):
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser', 'email': 'new@test.com', 'password': 'strongpass123'
        })
        self.assertEqual(res.status_code, 201)

    def test_register_rejects_short_password(self):
        res = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser', 'password': 'short'
        })
        self.assertEqual(res.status_code, 400)

    def test_login_returns_jwt(self):
        User.objects.create_user(username='loginuser', password='testpass123')
        res = self.client.post('/api/v1/auth/login/', {
            'username': 'loginuser', 'password': 'testpass123'
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_unauthenticated_request_rejected(self):
        res = self.client.get('/api/v1/goals/')
        self.assertEqual(res.status_code, 401)


class GoalTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='goaluser', password='pass1234')
        self.client = make_client(self.user)
        self.goal = Goal.objects.create(user=self.user, title='My Goal')

    def test_list_own_goals(self):
        res = self.client.get('/api/v1/goals/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_goal_progress_calculation(self):
        Task.objects.create(goal=self.goal, title='Task A', status='done')
        Task.objects.create(goal=self.goal, title='Task B', status='pending')
        res = self.client.get('/api/v1/goals/')
        self.assertEqual(res.data[0]['progress'], 50)

    def test_user_isolation(self):
        other = User.objects.create_user(username='other', password='pass1234')
        Goal.objects.create(user=other, title='Other Goal')
        res = self.client.get('/api/v1/goals/')
        self.assertEqual(len(res.data), 1)


class AnalyticsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='analyticsuser', password='pass1234')
        self.client = make_client(self.user)

    def test_analytics_returns_expected_keys(self):
        res = self.client.get('/api/v1/analytics/')
        self.assertEqual(res.status_code, 200)
        for key in ['total_tasks', 'completed', 'streak_days', 'productivity_score', 'daily_completion', 'priority_stats']:
            self.assertIn(key, res.data)

    def test_empty_state_is_safe(self):
        res = self.client.get('/api/v1/analytics/')
        self.assertEqual(res.data['total_tasks'], 0)
        self.assertEqual(res.data['streak_days'], 0)
        self.assertEqual(res.data['productivity_score'], 0)

    def test_streak_counts_today(self):
        goal = Goal.objects.create(user=self.user, title='G')
        Task.objects.create(goal=goal, title='T', status='done', completed_at=datetime.now(timezone.utc))
        res = self.client.get('/api/v1/analytics/')
        self.assertEqual(res.data['streak_days'], 1)
