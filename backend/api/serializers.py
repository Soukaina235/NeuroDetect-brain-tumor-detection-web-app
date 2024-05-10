from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from .models import Patient
from django.contrib.auth import get_user_model


# converting User to json data and vice-ersa

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         # the model that we want to serialize is the user model
#         model = User
#         # these are the fields that we want to serialize
#         fields = ["id", "username", "password"]
#         # this tells Django that we want to accept a password when we are creating a new user
#         # but we don't want to return the password when we are giving info about the user
#         # => so no one can read what the password is
#         extra_kwargs = {"password": {"write_only": True}}

#     # def validate(self, attr):
#     #     validate_password(attr['password'])
#     #     return attr

#     def create(self, validated_data):
#         # It passes the validated data received by the serializer as keyword arguments.
#         # This is equivalent to calling create_user(username="example_user", password="example_password")
#         # Hash the password using make_password before creating the user
#         print(validated_data)
#         user = User.objects.create_user(**validated_data)
#         return user

User = get_user_model()

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

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['firstname', 'lastname', 'email', 'phone', 'address', 'gender', 'age', 'status']

