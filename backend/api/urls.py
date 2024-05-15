from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('add_patient/', views.CreatePatientView.as_view(), name='add_patient'),
    path('patients/', views.patient_list, name='patients'),
    path('add_employee/', views.CreateUserView.as_view(), name='add_employee'),
    path('employees/', views.employee_list, name='employees'),
    path('get_role/', views.get_role), 
    path('predict_tumor/', views.predict_tumor_dl, name='predict_tumor'),
    path('patients/<int:id>/', views.update_patient_status, name='update_patient_status'),
    path('patients/<int:id>/results/', views.get_patient_prediction, name='get_patient_prediction'),
]



if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'scanners')
