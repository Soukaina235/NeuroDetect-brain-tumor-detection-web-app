from django.shortcuts import render
# from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from .models import Patient,TumorPrediction
from .serializers import PatientSerializer,TumorPredictionSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import get_object_or_404

# --------------------------------------------------------------------------

from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from django.forms.models import model_to_dict
from django.db.models.fields.files import FieldFile

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
    patients = Patient.objects.all().order_by('id').values()
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
    
def patient_directory_path(instance, filename):
    return 'patient_{0}/{1}'.format(instance.patient_id, filename)

@api_view(['POST'])
def predict_tumor(request):
    if request.method == 'POST':
        file = request.FILES['image']
        patient_id = request.POST['patient_id']

        patient = Patient.objects.get(id=patient_id)

        new_name = f"{slugify(patient.firstname)}_{slugify(patient.lastname)}.jpg"

        file.name = new_name

        print(new_name)

        # ---Image preprocessing -------------
        img = Image.open(file).convert('L')
        img = img.resize((150, 150))

        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.reshape(-1,150,150,1)

        # -----------Loading the model--------------
        model = load_model('../model/model_dl/BrainTumorClassifier_DL.h5')

        prediction = model.predict(img_array)
        print(prediction)

        probabilities = model.predict(img_array)

        predicted_index = np.argmax(probabilities)

        class_labels = ["glioma", "meningioma", "no tumor", "pituitary"]
        predicted_label = class_labels[np.argmax(prediction)]

        predicted_probability = probabilities[0][predicted_index] * 100

        print(f"Predicted label: {predicted_label} with probability {predicted_probability}")

        tumor_prediction = TumorPrediction.objects.create(
            patient_id=patient_id,  
            prediction=predicted_label,
            scanner=file,
            probability=predicted_probability  
            )

        serializer = TumorPredictionSerializer(tumor_prediction)

        return Response(serializer.data)


@csrf_exempt
def update_patient_status(request, id):
    print("hi")
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            patient = Patient.objects.get(id=id)
            print(patient.status)
            print(data)
            patient.status = data.get('status')
            patient.save()
            return JsonResponse({"message": "Patient status updated successfully."}, status=200)
        except Patient.DoesNotExist:
            return JsonResponse({"error": "Patient not found."}, status=404)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

def get_patient_prediction(request, id):
    try:
        prediction = TumorPrediction.objects.get(patient_id=id)
    except TumorPrediction.DoesNotExist:
        return JsonResponse({'error': 'Prediction not found'}, status=404)

    # Convert the FieldFile object to a string
    prediction_data = model_to_dict(prediction)
    for field in prediction_data:
        if isinstance(prediction_data[field], FieldFile):
            prediction_data[field] = request.build_absolute_uri(prediction_data[field].url)

    return JsonResponse(prediction_data)

def count_gender_tumor_patients(request):
    male_patients_with_tumor = TumorPrediction.objects.filter(patient__gender='M', prediction__in=['glioma', 'meningioma', 'pituitary']).count()
    female_patients_with_tumor = TumorPrediction.objects.filter(patient__gender='F', prediction__in=['glioma', 'meningioma', 'pituitary']).count()

    return JsonResponse({
        'male_patients_with_tumor': male_patients_with_tumor,
        'female_patients_with_tumor': female_patients_with_tumor
    })