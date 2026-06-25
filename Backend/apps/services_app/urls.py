from django.urls import path
from .views import InquiryView

urlpatterns = [
    path('inquiry', InquiryView.as_view(), name='service-inquiry'),
]
