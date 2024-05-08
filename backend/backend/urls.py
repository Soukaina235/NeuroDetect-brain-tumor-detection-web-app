from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView

# those are pre-built views that allow us to obtain our access token
# and refresh tokens and to refresh the token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    # whenever we go to something that has api/ and it wasn't one of the ones above
    # we are going to take the reminder of the path (what comes after api/) and we are
    # goingt to forward it to this file api.urls, inside of it we sill parse the reminder
    # of the path
    path("api/", include("api.urls"))
]
