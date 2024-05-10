from django.shortcuts import render
# from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from .models import Patient
from .serializers import PatientSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

# # this a generic view that is built intodjango that will automatically
# # handle creating a new user or creating a new object for us
# class CreateUserView(generics.CreateAPIView): 
#     # a list of all the available objects that we aare going to be looking at 
#     # to make sure that we don't create a user that already exists
#     queryset = User.objects.all()
#     # tells twhat can of data we need to accept to make the new user 
#     serializer_class = UserSerializer
#     # how can call this: here even users that are not authenticated can use this view
#     permission_classes =[AllowAny]

User = get_user_model()

class CreateUserView(generics.CreateAPIView): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes =[AllowAny]

class CreatePatientView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]


# class ListPatientView(generics.ListAPIView):
#     queryset = Patient.objects.all()
#     serializer_class = PatientSerializer

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = PatientSerializer(queryset, many=True)
#         return Response(serializer.data)


def patient_list(request):
    patients = Patient.objects.all().values() 
    patient_list = list(patients)  
    return JsonResponse(patient_list, safe=False)

def employee_list(request):
    employees = User.objects.all().values() 
    employee_list = list(employees)  
    return JsonResponse(employee_list, safe=False)

def get_role(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        print(user)
        return JsonResponse({'role': user.role})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=400)
    


