from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .services import YGOProDeckClient


@api_view(['GET'])
@permission_classes([AllowAny])
def search_cards(request):
    query = request.GET.get('q') or request.GET.get('name', '')
    page = max(1, int(request.GET.get('page', 1)))
    limit = max(1, min(100, int(request.GET.get('limit', 20))))

    if not query or not query.strip():
        return Response({
            'results': [],
            'page': page,
            'limit': limit,
            'total': 0,
        })

    try:
        data = YGOProDeckClient().search_cards(fname=query) or []
    except Exception as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    if isinstance(data, dict):
        items = data.get('data', [])
    else:
        items = data

    total = len(items)
    start = (page - 1) * limit
    end = start + limit

    return Response({
        'results': items[start:end],
        'page': page,
        'limit': limit,
        'total': total,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def card_detail(request, card_id):
    try:
        data = YGOProDeckClient().card_by_id(card_id)
    except Exception as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    if isinstance(data, dict):
        payload = data.get('data', [])
    else:
        payload = data

    if isinstance(payload, list) and payload:
        return Response(payload[0])

    return Response({}, status=status.HTTP_404_NOT_FOUND)