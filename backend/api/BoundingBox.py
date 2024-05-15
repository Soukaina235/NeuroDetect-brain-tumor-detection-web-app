import cv2
import numpy as np
from keras.models import load_model
import pydicom
from typing import Tuple
import matplotlib.pyplot as plt
from skimage.filters import threshold_yen\
from skimage.measure import label, regionprops
from medpy.filter.smoothing import anisotropic_diffusion


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
    print(f"Bounding Box Coordinates: ({bbox[0]}, {bbox[1]}) - ({bbox[2]}, {bbox[3]})")


# Load MRI image
image_path = 'cleaned/Testing/pituitary/Te-pi_0010.jpg'

# Pre-process the image
image = cv2.imread(image_path)
image_size = 200
resized_image = cv2.resize(image, (image_size, image_size))
normalized_image = resized_image / 255.0
input_image = np.expand_dims(normalized_image, axis=0)

# Load the trained model and the classes
model = load_model('final_model.keras')
class_names = ['glioma', 'meningioma', 'no tumor', 'pituitary']

# Make prediction
prediction = model.predict(input_image)

# Get the class with the highest probability
predicted_class = np.argmax(prediction)

# Print the precision of the classification result
precision = prediction[0][predicted_class]
print(f"Precision of the classification: {precision}")


# Draw bounding box around the detected tumor, if a tumor is detected
if predicted_class != 2:  # Class 2 represents 'notumor'
    # Apply anisotropic diffusion filter to the image
    filtered_image = apply_anisotropic_diffusion_filter(input_image)
    # Apply Yen threshold to the filtered image
    binary_image = apply_yen_threshold(filtered_image)
    # Apply labeling to the binary image
    labeled_image = apply_labeling(binary_image)

    # Get the coordinates of the bounding box for the largest region
    bbox = get_largest_region_properties(labeled_image[0])

    # Plot the image in the subplot with the bounding box
    fig, ax = plt.subplots()
    plot_image_with_bounding_box(input_image[0], bbox, ax, title="Scan with Bounding Box")

    # Show the plot
    plt.show()
