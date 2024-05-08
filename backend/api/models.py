from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    # We want it to automatically populate it whenever we want to make a new instance of this note
    created_at = models.DateTimeField(auto_now_add=True)
    # on to many relationship
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title 