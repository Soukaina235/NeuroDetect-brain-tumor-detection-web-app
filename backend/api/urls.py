from django.urls import path
from . import views

urlpatterns = [
    path('add_patient/', views.CreatePatientView.as_view(), name='add_patient'),
    path('patients/', views.patient_list, name='patients'),
    path('add_employee/', views.CreateUserView.as_view(), name='add_employee'),
    path('employees/', views.employee_list, name='employees'),
    path('get_role/', views.get_role), 
]
