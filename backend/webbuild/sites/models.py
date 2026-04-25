from django.db import models
from django.contrib.auth.models import User


def get_default_content():
    return [
        {
            "id": "1",
            "type": "HeroSection",
            "data": {"title": "عنوانك هنا", "subtitle": "وصف قصير لمشروعك", "buttonText": "ابدأ الآن"}
        }
    ]

class Website(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websites')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content_json = models.JSONField(default=get_default_content)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return self.name
    
    
    
class UserSite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    data = models.JSONField() # هذا هو المحتوى الذي لا يراه الأدمن في الفرونت اند
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"