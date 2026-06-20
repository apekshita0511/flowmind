from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({"status": "FlowMind API v1", "docs": "/api/v1/docs/"})


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/v1/', include('tasks.urls')),
    path('api/', include('tasks.urls')),  # backward compat for existing deployment
]
