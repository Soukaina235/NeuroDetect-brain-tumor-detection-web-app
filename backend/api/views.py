from django.shortcuts import render
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
import pydicom
from typing import Tuple
from skimage.filters import threshold_yen
from skimage.measure import label, regionprops
from medpy.filter.smoothing import anisotropic_diffusion
from django.core.files import File
import matplotlib.pyplot as plt



# Function to load a DICOM file and return its pixel array
def load_dicom_file(filename: str) -> np.ndarray:
    ds = pydicom.dcmread(filename)

    pixel_array = ds.pixel_array.astype(np.float32)

    pixel_array /= np.max(pixel_array)

    return pixel_array

# Function to apply an anisotropic diffusion filter to an image
def apply_anisotropic_diffusion_filter(image: np.ndarray) -> np.ndarray:
    filtered_image = anisotropic_diffusion(image, niter=5, kappa=50, gamma=0.1)

    return filtered_image

# Function to apply Yen's thresholding method to an image
def apply_yen_threshold(image: np.ndarray) -> np.ndarray:
    threshold_value = threshold_yen(image)
    binary_image = image > threshold_value

    return binary_image

# Function to label connected regions in a binary image
def apply_labeling(binary_image: np.ndarray) -> np.ndarray:
    labeled_image = label(binary_image)

    return labeled_image

# Function to get the properties of the largest region in a labeled image
def get_largest_region_properties(labeled_image: np.ndarray) -> Tuple[int, int, int, int]:
    if len(labeled_image.shape) == 3:
        labeled_image = labeled_image[..., 0] 
    elif len(labeled_image.shape) != 2:
        raise ValueError("Unsupported image dimensions")

    labeled_image = labeled_image.astype(np.uint8)

    labeled_image = label(labeled_image)

    regions = regionprops(labeled_image)

    region_indices_sorted_by_area = sorted(range(len(regions)), key=lambda i: regions[i].area, reverse=True)

    if len(regions) > 1:
        second_largest_region = regions[region_indices_sorted_by_area[1]]
        bbox = second_largest_region.bbox
    else:
        bbox = regions[0].bbox

    return bbox

# Function to plot an image with a bounding box
def plot_image_with_bounding_box(image: np.ndarray, bbox: Tuple[int, int, int, int],
                                 ax: plt.Axes, title: str) -> None:
    ax.imshow(image, cmap='gray')
    ax.axis('off')
    ax.set_title(title)

    rect = plt.Rectangle((bbox[1], bbox[0]), bbox[3] - bbox[1], bbox[2] - bbox[0],
                         linewidth=3, edgecolor='#ADD8E6', facecolor='none')
    ax.add_patch(rect)
    print(f"Bounding Box Coordinates: ({bbox[0]}, {bbox[1]}) - ({bbox[2]}, {bbox[3]}r())")

User = get_user_model()

# Class to create a new user
class CreateUserView(generics.CreateAPIView): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes =[AllowAny]

# Class to create a new patient
class CreatePatientView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]



# Function to get a list of all patients
def patient_list(request):
    patients = Patient.objects.all().order_by('id').values()
    patient_list = list(patients)
    return JsonResponse(patient_list, safe=False)

# Function to get a list of all employees
def employee_list(request):
    employees = User.objects.all().values() 
    employee_list = list(employees)  
    return JsonResponse(employee_list, safe=False)

# Function to get the role of a user
def get_role(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        print(user)
        return JsonResponse({'role': user.role})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User does not exist'}, status=400)
    

# Function to predict the presence of a tumor in a brain scan using a ResNet model
@api_view(['POST'])
def predict_tumor_resnet(request):
    if request.method == 'POST':
        file = request.FILES['image']
        patient_id = request.POST['patient_id']

        patient = Patient.objects.get(id=patient_id)

        new_name = f"{slugify(patient.firstname)}_{slugify(patient.lastname)}.jpg"

        file.name = new_name

        print(new_name)

        # ---Image preprocessing -------------
        img = Image.open(file).convert('RGB')
        img = img.resize((200, 200))

        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.reshape(-1,200,200,3)

        # -----------Loading the model--------------
        # model = load_model('../model/model_ResNet/model.weights.h5')
        # model.load_weights('../model/model_ResNet/model.weights.h5')

        # Load the JSON configuration of the model
        with open('../model/model_ResNet/config.json', 'r') as config_file:
            model_config = json.load(config_file)

        import tensorflow
        # Recreate the model architecture
        model = tensorflow.keras.models.model_from_json(json.dumps(model_config))

        # Load the weights into the model
        model.load_weights('../model/model_ResNet/model.weights.h5')

        prediction = model.predict(img_array)
        print(prediction)

        probabilities = model.predict(img_array)

        predicted_index = np.argmax(probabilities)

        class_labels = ["glioma", "meningioma", "notumor", "pituitary"]
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

# Function to predict the presence of a tumor in a brain scan using a deep learning model
@api_view(['POST'])
def predict_tumor_dl(request):
    if request.method == 'POST':
        file = request.FILES['image']
        patient_id = request.POST['patient_id']

        patient = Patient.objects.get(id=patient_id)

        new_name = f"{slugify(patient.firstname)}_{slugify(patient.lastname)}.jpg"

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

        class_labels = ["glioma", "meningioma", "notumor", "pituitary"]
        predicted_label = class_labels[np.argmax(prediction)]

        predicted_probability = probabilities[0][predicted_index] * 100

        print(f"Predicted label: {predicted_label} with probability {predicted_probability}")

        if predicted_label != 2:  # Class 2 represents 'notumor'

            filtered_image = apply_anisotropic_diffusion_filter(img_array)

            binary_image = apply_yen_threshold(filtered_image)
            labeled_image = apply_labeling(binary_image)

            box = get_largest_region_properties(labeled_image[0])

            fig, ax = plt.subplots()
            plot_image_with_bounding_box(img_array[0], box, ax, title=f"Scan of the patient : {patient_id}  and the type : {predicted_label}")

            fig.savefig(new_name)

            f = open(new_name, 'rb')
            content = File(f)

        tumor_prediction = TumorPrediction.objects.create(
            patient_id=patient_id,  
            prediction=predicted_label,
            scanner=content,
            probability=predicted_probability  
            )

        f.close()

        serializer = TumorPredictionSerializer(tumor_prediction)

        return Response(serializer.data)

# Function to update the status of a patient
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

# Function to get the prediction for a patient
def get_patient_prediction(request, id):
    try:
        prediction = TumorPrediction.objects.get(patient_id=id)
    except TumorPrediction.DoesNotExist:
        return JsonResponse({'error': 'Prediction not found'}, status=404)

    prediction_data = model_to_dict(prediction)
    for field in prediction_data:
        if isinstance(prediction_data[field], FieldFile):
            prediction_data[field] = request.build_absolute_uri(prediction_data[field].url)

    return JsonResponse(prediction_data)

# Function to count the number of male and female patients with a tumor
def count_gender_tumor_patients(request):
    male_patients_with_tumor = TumorPrediction.objects.filter(patient__gender='M', prediction__in=['glioma', 'meningioma', 'pituitary']).count()
    female_patients_with_tumor = TumorPrediction.objects.filter(patient__gender='F', prediction__in=['glioma', 'meningioma', 'pituitary']).count()

    return JsonResponse({
        'male_patients_with_tumor': male_patients_with_tumor,
        'female_patients_with_tumor': female_patients_with_tumor
    })












