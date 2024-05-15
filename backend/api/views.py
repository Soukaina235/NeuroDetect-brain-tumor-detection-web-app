import sys
print(sys.path)

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

import pydicom
from typing import Tuple

from skimage.filters import threshold_yen
from skimage.measure import label, regionprops
from medpy.filter.smoothing import anisotropic_diffusion
from django.core.files import File

# import sys 

# # sys.path.append('D:/OneDrive - Université Cadi Ayyad Marrakech/Documents/CI4/S4/Projet de module/Neuro_Detect/backend/api/BoundingBox.py')
# # from .BoundingBox import apply_anisotropic_diffusion_filter, apply_yen_threshold, apply_labeling, get_largest_region_properties
# import BoundingBox as BB
import matplotlib.pyplot as plt
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


def load_dicom_file(filename: str) -> np.ndarray:
    # Load the DICOM file
    ds = pydicom.dcmread(filename)

    # Convert the pixel data to a NumPy array
    pixel_array = ds.pixel_array.astype(np.float32)

    # Normalize the pixel values to the range [0, 1]
    pixel_array /= np.max(pixel_array)

    # Return the pixel array
    return pixel_array


def apply_anisotropic_diffusion_filter(image: np.ndarray) -> np.ndarray:
    filtered_image = anisotropic_diffusion(image, niter=5, kappa=50, gamma=0.1)

    # Return the filtered image
    return filtered_image


def apply_yen_threshold(image: np.ndarray) -> np.ndarray:
    threshold_value = threshold_yen(image)
    binary_image = image > threshold_value

    # Return the binary image
    return binary_image


def apply_labeling(binary_image: np.ndarray) -> np.ndarray:
    labeled_image = label(binary_image)

    # Return the labeled image
    return labeled_image


def get_largest_region_properties(labeled_image: np.ndarray) -> Tuple[int, int, int, int]:
    if len(labeled_image.shape) == 3:
        labeled_image = labeled_image[..., 0]  # Convert to 2D if it's a 3D image
    elif len(labeled_image.shape) != 2:
        raise ValueError("Unsupported image dimensions")

    # Make sure the labeled image is binary
    labeled_image = labeled_image.astype(np.uint8)

    # Label connected regions in the binary image
    labeled_image = label(labeled_image)

    # Calculate properties of connected regions in the labeled image
    regions = regionprops(labeled_image)

    # Find the indices of regions sorted by area in descending order
    region_indices_sorted_by_area = sorted(range(len(regions)), key=lambda i: regions[i].area, reverse=True)

    # Get the properties of the second-largest region
    if len(regions) > 1:
        second_largest_region = regions[region_indices_sorted_by_area[1]]
        bbox = second_largest_region.bbox
    else:
        # If there's only one region, return its properties
        bbox = regions[0].bbox

    return bbox


def plot_image_with_bounding_box(image: np.ndarray, bbox: Tuple[int, int, int, int],
                                 ax: plt.Axes, title: str) -> None:
    # Plot the image on the given axes
    ax.imshow(image, cmap='gray')
    ax.axis('off')
    ax.set_title(title)

    # Add a rectangle patch to the axes to represent the bounding box
    rect = plt.Rectangle((bbox[1], bbox[0]), bbox[3] - bbox[1], bbox[2] - bbox[0],
                         linewidth=3, edgecolor='#ADD8E6', facecolor='none')
    ax.add_patch(rect)
    print(f"Bounding Box Coordinates: ({bbox[0]}, {bbox[1]}) - ({bbox[2]}, {bbox[3]}r())")

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
    

@api_view(['POST'])
def predict_tumor(request):
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

        class_labels = ["glioma", "meningioma", "no tumor", "pituitary"]
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












