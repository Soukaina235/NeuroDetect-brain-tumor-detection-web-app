from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note

# Create your views here.

# this a generic view that is built intodjango that will automatically
# handle creating a new user or creating a new object for us
class CreateUserView(generics.CreateAPIView): 
    # a list of all the available objects that we aare going to be looking at 
    # to make sure that we don't create a user that already exists
    queryset = User.objects.all()
    # tells twhat can of data we need to accept to make the new user 
    serializer_class = UserSerializer
    # how can call this: here even users that are not authenticated can use this view
    permission_classes =[AllowAny]

# we are using ListCreateAPIView because this view will do two things:
# 1. list all of the notes that the user have created
# 2. create a new note
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    # cannot access this route unless you are authenticated and pass a valid JWT token
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # get the user that is authenticated
        user = self.request.user
        # gets the notes written by this user
        return Note.objects.filter(author=user) 
    
    # we can work with it without overriding it, but we want to have some custom functionalities
    # so we are overriding it
    def perform_create(self, serializer):
        if serializer.is_valid():
            # we will have an additional field that will add onto that note 
            # because the author is read-only, so it won't be passed to us
            # we should manually add it ourself
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    # we are not doing this
    # queryset = Note.objects.all()
    # because, we want to delete only notes that we own and not all the notes, 
    # so we are filtering them like so
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user) 