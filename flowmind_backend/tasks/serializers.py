from rest_framework import serializers
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