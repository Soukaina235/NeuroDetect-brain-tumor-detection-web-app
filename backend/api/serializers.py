from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from .models import Note


# converting User to json data and vice-ersa

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        # the model that we want to serialize is the user model
        model = User
        # these are the fields that we want to serialize
        fields = ["id", "username", "password"]
        # this tells Django that we want to accept a password when we are creating a new user
        # but we don't want to return the password when we are giving info about the user
        # => so no one can read what the password is
        extra_kwargs = {"password": {"write_only": True}}

    # def validate(self, attr):
    #     validate_password(attr['password'])
    #     return attr

    def create(self, validated_data):
        # It passes the validated data received by the serializer as keyword arguments.
        # This is equivalent to calling create_user(username="example_user", password="example_password")
        # Hash the password using make_password before creating the user
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
    

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        # set by the backend not by just someone deciding who the author should be
        extra_kwargs = {'author': {'read_only': True}}