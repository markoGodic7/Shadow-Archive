from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'shadow-archive-backend'})


urlpatterns = [
    path('', health_check, name='root-health'),
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('src.apps.cards.urls')),
]
