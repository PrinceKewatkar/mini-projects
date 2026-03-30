from django.urls import path
from .views import (
    SeatStatusView, QuotaStatusView,
    PendingDocumentsView, PendingFeesView, DashboardSummaryView
)

urlpatterns = [
    path('seat-status/', SeatStatusView.as_view(), name='seat-status'),
    path('quota-status/', QuotaStatusView.as_view(), name='quota-status'),
    path('pending-documents/', PendingDocumentsView.as_view(), name='pending-documents'),
    path('pending-fees/', PendingFeesView.as_view(), name='pending-fees'),
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]