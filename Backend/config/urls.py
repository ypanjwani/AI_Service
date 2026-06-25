from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

@ensure_csrf_cookie
@require_GET
def csrf_view(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('api/auth/csrf/', csrf_view),            # must be before the include below
    path('api/auth/',     include('apps.auth_app.urls')),
    path('api/services/', include('apps.services_app.urls')),
    path('health/',       lambda req: JsonResponse({'status': 'ok'})),
]
