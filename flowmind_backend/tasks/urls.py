from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ai_chat, focus_task

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', ai_chat),
    path('focus/', focus_task),
]