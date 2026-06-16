from django.http import HttpResponse
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: HttpResponse(status=204)),
]
