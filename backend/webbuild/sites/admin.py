from django.contrib import admin
from .models import Website


@admin.register(Website)
class WebsiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'created_at') # الأعمدة التي ستظهر في الجدول
    search_fields = ('name', 'slug') # إضافة خانة بحث