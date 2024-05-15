from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

# Patient related URLs
urlpatterns = [
    path('add_patient/', views.CreatePatientView.as_view(), name='add_patient'),
    path('patients/', views.patient_list, name='patients'),
    path('patients/<int:id>/', views.update_patient_status, name='update_patient_status'),
    path('patients/<int:id>/results/', views.get_patient_prediction, name='get_patient_prediction'),
    path('count_gender_tumor_patients/', views.count_gender_tumor_patients, name='count_gender_tumor_patients'),
]

# Employee related URLs
urlpatterns += [
    path('add_employee/', views.CreateUserView.as_view(), name='add_employee'),
    path('employees/', views.employee_list, name='employees'),
    path('get_role/', views.get_role),
]

# Tumor prediction related URL
urlpatterns += [
    path('predict_tumor/', views.predict_tumor_dl, name='predict_tumor'),
]

# Static files URL configuration for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'scanners')