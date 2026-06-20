from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, Goal


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = '__all__'

    def get_progress(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        done = obj.tasks.filter(status='done').count()
        return round((done / total) * 100)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
