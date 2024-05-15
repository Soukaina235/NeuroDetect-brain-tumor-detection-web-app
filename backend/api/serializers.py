from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Patient, TumorPrediction

# Get the user model
User = get_user_model()

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "last_login", "role", "first_name", "last_name", "email"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

# Patient Serializer
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['firstname', 'lastname', 'email', 'phone', 'address', 'gender', 'age', 'status']

# Tumor Prediction Serializer
class TumorPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TumorPrediction
        fields = ['id', 'patient', 'prediction', 'scanner', 'probability']