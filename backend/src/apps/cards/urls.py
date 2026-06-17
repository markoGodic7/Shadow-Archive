from django.urls import path

from .views import card_detail, search_cards

urlpatterns = [
    path('cards/search/', search_cards, name='card-search'),
    path('cards/<str:card_id>/', card_detail, name='card-detail'),
]
