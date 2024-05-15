from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views import CreateUserView

# Admin URL
urlpatterns = [
    path('admin/', admin.site.urls),
]

# User related URLs
urlpatterns += [
    path("api/user/register/", CreateUserView.as_view(), name="register"),
]

# Token related URLs
urlpatterns += [
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
]

# Authentication related URL
urlpatterns += [
    path("api-auth/", include("rest_framework.urls")),
]

# API related URLs
urlpatterns += [
    path("api/", include("api.urls")),
]