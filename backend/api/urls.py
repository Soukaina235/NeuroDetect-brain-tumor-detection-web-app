from django.urls import path
from . import views

urlpatterns = [
    path('add_patient/', views.CreatePatientView.as_view(), name='add_patient'),
    path('patients/', views.patient_list, name='patients'),
]
