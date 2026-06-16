from django.db import models


class Goal(models.Model):
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Task(models.Model):
    PRIORITY_CHOICES = [
        (1, "Low"),
        (2, "Medium"),
        (3, "High"),
        (4, "Urgent"),
        (5, "Critical"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("done", "Done"),
        ("in_progress", "In Progress"),
    ]

    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name="tasks",
        null=True,
        blank=True,
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    scheduled_for = models.DateTimeField(null=True, blank=True)
    source = models.CharField(max_length=10, default="user")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title